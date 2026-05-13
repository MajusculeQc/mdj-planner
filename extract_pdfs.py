import os
import PyPDF2

docs_dir = 'docs'
for filename in os.listdir(docs_dir):
    if filename.endswith('.pdf'):
        filepath = os.path.join(docs_dir, filename)
        outpath = filepath + '.txt'
        print(f'Extracting {filepath}...')
        try:
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = []
                for page in reader.pages:
                    text.append(page.extract_text() or '')
                
            with open(outpath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(text))
            print(f'Done: {outpath}')
        except Exception as e:
            print(f'Error extracting {filepath}: {e}')
