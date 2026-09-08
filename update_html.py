import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open(r'c:\Users\murli\.gemini\antigravity-ide\brain\a17166e0-41ad-4063-ad0d-01ceede27bb2\scratch\new_pricing_content.html', 'r', encoding='utf-8') as f:
    new_html = f.read()

# Replace everything from <!-- Segmented Tab Nav --> to <!-- History Section (Dynamically Populated) -->
pattern = re.compile(r'(<!-- Segmented Tab Nav -->).*?(<!-- History Section \(Dynamically Populated\) -->)', re.DOTALL)
new_content = pattern.sub(new_html + '\n\n        \\2', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated index.html tabs.')
