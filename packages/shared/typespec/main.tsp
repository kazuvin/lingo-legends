import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "@typespec/versioning";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.Versioning;

@service(#{
  title: "Lingo Legends API",
})
@server("http://localhost:3000", "Development server")
@versioned(Versions)
namespace LingoLegends;

enum Versions {
  v1: "v1",
}

// POS Codes
enum PosCode {
  Noun: "n",
  Verb: "v",
  Adjective: "a",
  AdjectiveSatellite: "s",
  Adverb: "r",
}

// Lex File Numbers
enum LexFileNum {
  AdjAll: 0,
  AdjPert: 1,
  AdvAll: 2,
  NounTops: 3,
  NounAct: 4,
  NounAnimal: 5,
  NounArtifact: 6,
  NounAttribute: 7,
  NounBody: 8,
  NounCognition: 9,
  NounCommunication: 10,
  NounEvent: 11,
  NounFeeling: 12,
  NounFood: 13,
  NounGroup: 14,
  NounLocation: 15,
  NounMotive: 16,
  NounObject: 17,
  NounPerson: 18,
  NounPhenomenon: 19,
  NounPlant: 20,
  NounPossession: 21,
  NounProcess: 22,
  NounQuantity: 23,
  NounRelation: 24,
  NounShape: 25,
  NounState: 26,
  NounSubstance: 27,
  NounTime: 28,
  VerbBody: 29,
  VerbChange: 30,
  VerbCognition: 31,
  VerbCommunication: 32,
  VerbCompetition: 33,
  VerbConsumption: 34,
  VerbContact: 35,
  VerbCreation: 36,
  VerbEmotion: 37,
  VerbMotion: 38,
  VerbPerception: 39,
  VerbPossession: 40,
  VerbSocial: 41,
  VerbStative: 42,
  VerbWeather: 43,
  AdjPpl: 44,
}

// Pointer Symbols
enum PointerSymbol {
  Hypernym: "@",
  InstanceHypernym: "@i",
  Hyponym: "~",
  InstanceHyponym: "~i",
  MemberHolonym: "#m",
  SubstanceHolonym: "#s",
  PartHolonym: "#p",
  MemberMeronym: "%m",
  SubstanceMeronym: "%s",
  PartMeronym: "%p",
  Attribute: "=",
  DerivationallyRelatedForm: "+",
  Antonym: "!",
  SimilarTo: "&",
  ParticipleOfVerb: "<",
  Entailment: "*",
  Cause: ">",
  AlsoSee: "^",
  VerbGroup: "$",
  DomainOfSynsetTopic: ";c",
  DomainOfSynsetRegion: ";r",
  DomainOfSynsetUsage: ";u",
  MemberOfThisDomainTopic: "-c",
  MemberOfThisDomainRegion: "-r",
  MemberOfThisDomainUsage: "-u",
  DerivedFromAdjective: "\\\\",
}

// Word Relation Model
model WordRelation {
  id: int32;
  lemma: string;
  pointerSymbol: PointerSymbol;
  sourceTarget: string;
}

// Word Meaning Model (individual meaning/synset)
model WordMeaning {
  id: int32;
  gloss: string;
  posCode: PosCode;
  lexFileNum: LexFileNum;
  relations: WordRelation[];
}

// Word Model (grouped by lemma)
model Word {
  lemma: string;
  meanings: WordMeaning[];
}

// Words Response Model
model WordsResponse {
  words: Word[];
  count: int32;
}

@route("/words")
namespace Words {
  @get
  op getWords(
    @query ids?: string,
    @query random?: boolean,
    @query count?: int32,
    @query pos?: PosCode,
    @query lexFileNum?: LexFileNum,
    @query lang?: string,
    @query lemma?: string,
    @query exact?: boolean,
  ): WordsResponse;
}
