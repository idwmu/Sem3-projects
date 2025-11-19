import ply.lex as lex

tokens = [
    'ID', 'NUMBER', 
    'EQUALS', 
    'LPAREN', 'RPAREN', 
    'NEWLINE',
    'TO', 'STEP', 'NEXT', 'IF', 'THEN', 'END', 'DIM', 'AS', 'FOR'
]

reserved = {
    'If'   : 'IF',
    'Then' : 'THEN',
    'End'  : 'END',
    'For'  : 'FOR',
    'Next' : 'NEXT',
    'To'   : 'TO',
    'Step' : 'STEP',
    'Dim'  : 'DIM',
    'As'   : 'AS'
}

tokens += list(set(reserved.values()))

t_EQUALS = r'='
t_LPAREN = r'\('
t_RPAREN = r'\)'
t_ignore = ' \t'

def t_ID(t):
    r'[A-Za-z_][A-Za-z0-9_]*'
    t.type = reserved.get(t.value, 'ID')
    return t

def t_NUMBER(t):
    r'\d+'
    t.value = int(t.value)
    return t

def t_NEWLINE(t):
    r'\n+'
    t.lexer.lineno += len(t.value)
    return t

def t_error(t):
    print(f"Illegal character {t.value[0]}")
    t.lexer.skip(1)

lexer = lex.lex()
