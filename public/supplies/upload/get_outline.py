import sys
import fitz  # PyMuPDF

def get_outline(pdf_path):
    doc = fitz.open(pdf_path)
    toc = doc.get_toc()
    for item in toc:
        print(f"{item[0]} | {item[1]} | {item[2]}")

if __name__ == "__main__":
    get_outline(sys.argv[1])
