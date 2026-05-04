import re

with open('dhanush_portfolio_final (2).html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'<img src="data:image/jpeg;base64,.*?" alt="Dhanush Siddilingam">',
    r'<img src="dhanush_image.jpeg" alt="Dhanush Siddilingam">',
    content
)

with open('dhanush_portfolio_final (2).html', 'w', encoding='utf-8') as f:
    f.write(content)
