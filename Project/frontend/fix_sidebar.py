import re

file_path = '/root/MedTrustX/Project/frontend/src/components/layout/Sidebar.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Fix the missing brackets
content = re.sub(r'},\n\];', '},\n  ]}\n];', content)

with open(file_path, 'w') as f:
    f.write(content)

print('Fixed missing braces in Sidebar.tsx')
