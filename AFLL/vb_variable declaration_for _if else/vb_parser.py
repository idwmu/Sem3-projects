import ply.yacc as yacc
from vb_lexer import tokens

def p_program(p):
    '''program : statement_list'''
    pass

def p_statement_list(p):
    '''statement_list : statement
                      | statement_list statement'''
    pass

def p_statement(p):
    '''statement : var_decl
                 | for_loop
                 | if_stmt'''
    pass

def p_var_decl(p):
    '''var_decl : DIM ID AS ID NEWLINE
                | DIM ID AS ID EQUALS NUMBER NEWLINE'''
    pass

def p_for_loop(p):
    '''for_loop : FOR ID EQUALS NUMBER TO NUMBER statement_list NEXT ID NEWLINE
                | FOR ID EQUALS NUMBER TO NUMBER STEP NUMBER statement_list NEXT ID NEWLINE'''
    pass

def p_if_stmt(p):
    '''if_stmt : IF condition THEN statement_list END IF NEWLINE'''
    pass

def p_condition(p):
    '''condition : ID EQUALS NUMBER
                 | ID
                 | NUMBER'''
    pass

def p_error(p):
    if p:
        print(f"Syntax error at token {p.type!r}, value {p.value!r}")
    else:
        print("Syntax error at EOF")

parser = yacc.yacc()
