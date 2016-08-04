%lex

%s exp

%%

<exp>\s+                                            /* skip whitespace */
<exp>"*"                                            return '*';
<exp>"/"                                            return '/';
<exp>"-"                                            return '-';
<exp>"+"                                            return '+';
<exp>"%"                                            return '%';
<exp>[a-zA-Z_\-.][a-zA-Z0-9_\-.]*                   return 'IDENTIFIER';
"${"                                                this.begin('exp'); return 'EXPR_START';
<exp>"}"                                            this.popState(); return 'EXPR_END';
<exp>\"                                             this.begin('INITIAL'); return 'DOUBLE_QOUTE';
<INITIAL>\"                                         this.popState(); return 'DOUBLE_QOUTE';
<exp>0x[0-9a-fA-F][0-9a-fA-F]*(?:.[0-9a-fA-F]+)?\b  return 'HEXADECIMAL';
<exp>[1-9][0-9]*(?:.[0-9]+)?\b                      return 'DECIMAL';
<exp>0[1-7][0-7]*(?:.[0-7]+)?\b                     return 'OCTAL';
<exp>"e"                                            return 'SCIENTIFIC';
<<EOF>>                                             return 'EOF';
<INITIAL>(\\.|[^\\"$]|$[^\\"{])*                    return 'STRING';

/lex

%left '%'
%left '+' '-'
%left '*' '/'
%left '^'
%left UMINUS

%ebnf

%%

program
  : string* EOF {return $1 instanceof Array ? $1.join('') : $1}
  ;

string
  : EXPR_START exp EXPR_END -> $exp
  | STRING -> yytext.replace(/\\*/g, m => new Array(Math.floor(m.length / 2) + 1).join('\\'))
  ;

exp
  : exp '+' exp -> $exp1 + $exp2
  | exp '-' exp -> $exp1 - $exp2
  | exp '*' exp -> $exp1 * $exp2
  | exp '/' exp -> $exp1 / $exp2
  | exp '%' exp -> ($exp1 / 100) * $exp2
  | '-' exp %prec UMINUS -> -$exp
  | number -> $number
  | IDENTIFIER -> yy[yytext]
  | DOUBLE_QOUTE string* DOUBLE_QOUTE -> $2 instanceof Array ? $2.join('') : $2
  ;

number
  : numberliteral -> $numberliteral
  | numberliteral SCIENTIFIC numberliteral -> $number1 * Math.pow(10, $number2)
  ;

numberliteral
  : HEXADECIMAL -> Number(yytext)
  | DECIMAL -> Number(yytext)
  | OCTAL -> Number(yytext.replace(/^0/, '0o'))
  ;
