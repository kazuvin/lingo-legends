import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '~/utils';
import { useI18n } from '~/lib/i18n';
import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

type CodeProps = {
  children: string;
  language?: string;
  className?: string;
  showCopy?: boolean;
  onCopy?: () => void;
};

export function Code({ children, language = 'css', className, showCopy = false, onCopy }: CodeProps) {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);
  const [highlightedCode, setHighlightedCode] = React.useState('');

  React.useEffect(() => {
    if (children.trim()) {
      const lang = Prism.languages[language] || Prism.languages.css;
      const highlighted = Prism.highlight(children, lang, language);
      setHighlightedCode(highlighted);
    } else {
      setHighlightedCode('');
    }
  }, [children, language]);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [children, onCopy]);

  const isEmpty = !children.trim() || children === '@theme {\n\n}';

  return (
    <div className={cn('relative group', className)}>
      <pre className="bg-muted overflow-x-auto rounded-md p-4 font-mono text-xs">
        {isEmpty ? (
          <div className="text-muted-foreground flex items-center justify-center py-4">
            {t('code.empty', { ns: 'ui' })}
          </div>
        ) : (
          <code 
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        )}
      </pre>
      {showCopy && !isEmpty && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'absolute top-2 right-2 h-8 w-8 p-0 transition-colors',
            copied && 'border-green-200 bg-green-50 text-green-700'
          )}
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
