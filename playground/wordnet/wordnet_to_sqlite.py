#!/usr/bin/env python3
"""
WordNet辞書データをSQLiteデータベースに変換するスクリプト
"""

import sqlite3
import re
import os
from pathlib import Path

def create_database_schema(conn):
    """SQLiteデータベーススキーマを作成（改善版）"""
    cursor = conn.cursor()

    # 品詞マスターテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pos_types (
            pos_code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')

    # 語彙ファイルマスターテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lex_file_types (
            file_num INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')

    # 関係種別マスターテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pointer_types (
            symbol TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT
        )
    ''')

    # synsets テーブル (語義グループ)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS synsets (
            synset_offset TEXT PRIMARY KEY,
            lex_file_num INTEGER NOT NULL,
            pos_code TEXT NOT NULL,
            gloss TEXT,
            FOREIGN KEY (lex_file_num) REFERENCES lex_file_types (file_num),
            FOREIGN KEY (pos_code) REFERENCES pos_types (pos_code)
        )
    ''')

    # words テーブル (単語)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lemma TEXT NOT NULL,
            pos_code TEXT NOT NULL,
            synset_offset TEXT NOT NULL,
            lex_id INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (synset_offset) REFERENCES synsets (synset_offset) ON DELETE CASCADE,
            FOREIGN KEY (pos_code) REFERENCES pos_types (pos_code)
        )
    ''')

    # pointers テーブル (語義間の関係)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pointers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_synset_offset TEXT NOT NULL,
            pointer_symbol TEXT NOT NULL,
            target_synset_offset TEXT NOT NULL,
            source_target TEXT,
            FOREIGN KEY (source_synset_offset) REFERENCES synsets (synset_offset) ON DELETE CASCADE,
            FOREIGN KEY (target_synset_offset) REFERENCES synsets (synset_offset) ON DELETE CASCADE,
            FOREIGN KEY (pointer_symbol) REFERENCES pointer_types (symbol)
        )
    ''')

    # 複合インデックス作成（クエリ性能最適化）
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_words_lemma_pos ON words (lemma, pos_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_words_synset ON words (synset_offset)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_synsets_pos ON synsets (pos_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_pointers_source ON pointers (source_synset_offset, pointer_symbol)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_pointers_target ON pointers (target_synset_offset)')

    # VIEWを作成（word_indexテーブルの代替）
    cursor.execute('''
        CREATE VIEW IF NOT EXISTS word_index AS
        SELECT
            w.lemma,
            w.pos_code,
            COUNT(DISTINCT w.synset_offset) as synset_cnt,
            COUNT(DISTINCT p.pointer_symbol) as p_cnt,
            GROUP_CONCAT(DISTINCT p.pointer_symbol) as ptr_symbol,
            COUNT(DISTINCT w.synset_offset) as sense_cnt,
            0 as tagsense_cnt,
            GROUP_CONCAT(DISTINCT w.synset_offset) as synset_offsets
        FROM words w
        LEFT JOIN pointers p ON w.synset_offset = p.source_synset_offset
        GROUP BY w.lemma, w.pos_code
    ''')

    conn.commit()

def parse_data_file(filepath):
    """dataファイルを解析してsynsetsとwordsのデータを抽出"""
    synsets = []
    words = []
    pointers = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue

            try:
                # 基本情報を解析
                parts = line.split(' ')
                synset_offset = parts[0]
                lex_filenum = int(parts[1])
                ss_type = parts[2]
                w_cnt = int(parts[3], 16)  # 16進数
                
                # 単語部分を解析
                word_start = 4
                word_data = []
                for i in range(w_cnt):
                    word = parts[word_start + i * 2]
                    lex_id = int(parts[word_start + i * 2 + 1], 16)
                    word_data.append((word, lex_id))
                    words.append((word, ss_type, synset_offset, lex_id))
                
                # ポインター情報を解析
                ptr_start = word_start + w_cnt * 2
                p_cnt = int(parts[ptr_start])
                
                for i in range(p_cnt):
                    ptr_idx = ptr_start + 1 + i * 4
                    if ptr_idx + 3 < len(parts):
                        pointer_symbol = parts[ptr_idx]
                        target_synset = parts[ptr_idx + 1]
                        source_target = parts[ptr_idx + 3]
                        pointers.append((synset_offset, pointer_symbol, target_synset, source_target))
                
                # glossを抽出
                gloss_start = line.find('|')
                gloss = line[gloss_start + 1:].strip() if gloss_start != -1 else ""
                
                synsets.append((synset_offset, lex_filenum, ss_type, gloss))
                
            except (IndexError, ValueError) as e:
                print(f"Warning: Error parsing line {line_num} in {filepath}: {e}")
                continue
    
    return synsets, words, pointers

def insert_pos_types(conn):
    """品詞マスターデータを投入"""
    cursor = conn.cursor()

    pos_types = [
        ('n', 'Noun', '名詞'),
        ('v', 'Verb', '動詞'),
        ('a', 'Adjective', '形容詞'),
        ('s', 'Adjective Satellite', '形容詞（衛星）'),
        ('r', 'Adverb', '副詞'),
    ]

    cursor.executemany(
        'INSERT OR REPLACE INTO pos_types (pos_code, name, description) VALUES (?, ?, ?)',
        pos_types
    )

    conn.commit()

def insert_lex_file_types(conn):
    """語彙ファイルマスターデータを投入"""
    cursor = conn.cursor()

    lex_file_types = [
        (0, 'adj.all', '全形容詞'),
        (1, 'adj.pert', '関係形容詞'),
        (2, 'adv.all', '全副詞'),
        (3, 'noun.Tops', '最上位概念'),
        (4, 'noun.act', '行為・出来事'),
        (5, 'noun.animal', '動物'),
        (6, 'noun.artifact', '人工物'),
        (7, 'noun.attribute', '属性'),
        (8, 'noun.body', '身体部位'),
        (9, 'noun.cognition', '認知・知識'),
        (10, 'noun.communication', 'コミュニケーション'),
        (11, 'noun.event', '出来事'),
        (12, 'noun.feeling', '感情'),
        (13, 'noun.food', '食べ物'),
        (14, 'noun.group', '集団'),
        (15, 'noun.location', '場所'),
        (16, 'noun.motive', '動機'),
        (17, 'noun.object', '物体'),
        (18, 'noun.person', '人物'),
        (19, 'noun.phenomenon', '現象'),
        (20, 'noun.plant', '植物'),
        (21, 'noun.possession', '所有物'),
        (22, 'noun.process', 'プロセス'),
        (23, 'noun.quantity', '量'),
        (24, 'noun.relation', '関係'),
        (25, 'noun.shape', '形状'),
        (26, 'noun.state', '状態'),
        (27, 'noun.substance', '物質'),
        (28, 'noun.time', '時間'),
        (29, 'verb.body', '身体動作'),
        (30, 'verb.change', '変化'),
        (31, 'verb.cognition', '認知動作'),
        (32, 'verb.communication', 'コミュニケーション動作'),
        (33, 'verb.competition', '競争'),
        (34, 'verb.consumption', '消費'),
        (35, 'verb.contact', '接触'),
        (36, 'verb.creation', '創造'),
        (37, 'verb.emotion', '感情表現'),
        (38, 'verb.motion', '移動'),
        (39, 'verb.perception', '知覚'),
        (40, 'verb.possession', '所有'),
        (41, 'verb.social', '社会的行為'),
        (42, 'verb.stative', '状態動詞'),
        (43, 'verb.weather', '天候'),
        (44, 'adj.ppl', '過去分詞形容詞'),
    ]

    cursor.executemany(
        'INSERT OR REPLACE INTO lex_file_types (file_num, name, description) VALUES (?, ?, ?)',
        lex_file_types
    )

    conn.commit()

def insert_pointer_types(conn):
    """関係種別マスターデータを投入"""
    cursor = conn.cursor()

    pointer_types = [
        ('@', 'Hypernym', '上位語（より一般的な概念）'),
        ('@i', 'Instance Hypernym', '上位語（インスタンス）'),
        ('~', 'Hyponym', '下位語（より具体的な概念）'),
        ('~i', 'Instance Hyponym', '下位語（インスタンス）'),
        ('#m', 'Member holonym', '全体-部分関係（メンバー）'),
        ('#s', 'Substance holonym', '全体-部分関係（物質）'),
        ('#p', 'Part holonym', '全体-部分関係（部品）'),
        ('%m', 'Member meronym', '部分-全体関係（メンバー）'),
        ('%s', 'Substance meronym', '部分-全体関係（物質）'),
        ('%p', 'Part meronym', '部分-全体関係（部品）'),
        ('=', 'Attribute', '属性'),
        ('+', 'Derivationally related form', '派生語'),
        ('!', 'Antonym', '反意語'),
        ('&', 'Similar to', '類似'),
        ('<', 'Participle of verb', '動詞の分詞形'),
        ('*', 'Entailment', '含意（動詞間の関係）'),
        ('>', 'Cause', '原因'),
        ('^', 'Also see', '参照'),
        ('$', 'Verb Group', '動詞グループ'),
        (';c', 'Domain of synset - TOPIC', 'トピック分野'),
        (';r', 'Domain of synset - REGION', '地域分野'),
        (';u', 'Domain of synset - USAGE', '用法分野'),
        ('-c', 'Member of this domain - TOPIC', 'このトピック分野のメンバー'),
        ('-r', 'Member of this domain - REGION', 'この地域分野のメンバー'),
        ('-u', 'Member of this domain - USAGE', 'この用法分野のメンバー'),
        ('\\', 'Derived from adjective', '形容詞から派生'),
    ]

    cursor.executemany(
        'INSERT OR REPLACE INTO pointer_types (symbol, name, description) VALUES (?, ?, ?)',
        pointer_types
    )

    conn.commit()

def import_wordnet_data(wordnet_dir, db_path):
    """WordNetデータをSQLiteデータベースにインポート"""
    conn = sqlite3.connect(db_path)

    # 一時的に外部キー制約を無効化
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys = OFF')

    create_database_schema(conn)

    # マスターデータを投入
    print("Inserting master data...")
    insert_pos_types(conn)
    insert_lex_file_types(conn)
    insert_pointer_types(conn)

    # 品詞リスト
    pos_types = ['noun', 'verb', 'adj', 'adv']

    print("\nImporting synsets and words...")
    for pos in pos_types:
        data_file = os.path.join(wordnet_dir, f'data.{pos}')
        if os.path.exists(data_file):
            print(f"Processing {data_file}...")
            synsets, words, pointers = parse_data_file(data_file)

            # synsets挿入
            cursor.executemany(
                'INSERT OR REPLACE INTO synsets (synset_offset, lex_file_num, pos_code, gloss) VALUES (?, ?, ?, ?)',
                synsets
            )

            # words挿入
            cursor.executemany(
                'INSERT INTO words (lemma, pos_code, synset_offset, lex_id) VALUES (?, ?, ?, ?)',
                words
            )

            # pointers挿入
            cursor.executemany(
                'INSERT INTO pointers (source_synset_offset, pointer_symbol, target_synset_offset, source_target) VALUES (?, ?, ?, ?)',
                pointers
            )

            print(f"  - {len(synsets)} synsets, {len(words)} words, {len(pointers)} pointers")

    conn.commit()

    # 外部キー制約を再度有効化
    cursor.execute('PRAGMA foreign_keys = ON')
    conn.commit()

    conn.close()
    print(f"\nDatabase created successfully: {db_path}")

def main():
    """メイン関数"""
    wordnet_dir = 'wordnet_dict'
    db_path = 'wordnet.db'
    
    if not os.path.exists(wordnet_dir):
        print(f"Error: WordNet directory '{wordnet_dir}' not found")
        return
    
    print("WordNet to SQLite Converter")
    print("=" * 40)
    print(f"Source directory: {wordnet_dir}")
    print(f"Output database: {db_path}")
    print()
    
    import_wordnet_data(wordnet_dir, db_path)
    
    # データベース統計を表示
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM synsets')
    synset_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM words')
    word_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM pointers')
    pointer_count = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM pos_types')
    pos_count = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM lex_file_types')
    lex_file_count = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM pointer_types')
    ptrtype_count = cursor.fetchone()[0]

    print(f"\nDatabase Statistics:")
    print(f"- Synsets: {synset_count:,}")
    print(f"- Words: {word_count:,}")
    print(f"- Pointers: {pointer_count:,}")
    print(f"- POS types: {pos_count}")
    print(f"- Lexical file types: {lex_file_count}")
    print(f"- Pointer types: {ptrtype_count}")
    print(f"\nNote: word_index is now a VIEW and can be queried like a table.")

    conn.close()

if __name__ == '__main__':
    main()