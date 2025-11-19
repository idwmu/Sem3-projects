from vb_lexer import lexer
from vb_parser import parser

def main():
    while True:
        user_input = input("Enter Visual Basic code (or 'exit' to quit):\n")
        if user_input.lower() == 'exit':
            break
        result = parser.parse(user_input, lexer=lexer)
        if result is None:
            print("Parsing successful: Input is valid.")
        else:
            print("Parsing result:", result)

if __name__ == "__main__":
    main()
