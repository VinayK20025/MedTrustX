import os
import re

endpoints_file = "/root/MedTrustX/Project/frontend/src/services/autoEndpoints.ts"
dashboard_dir = "/root/MedTrustX/Project/frontend/src/app/dashboard"

endpoint_keys = []
with open(endpoints_file, "r") as f:
    content = f.read()
    keys = re.findall(r'^\s+([a-zA-Z0-9_]+):\s*\{', content, re.MULTILINE)
    endpoint_keys = keys

def get_best_endpoint(path_parts):
    for part in reversed(path_parts):
        normalized = part.replace('-', '').lower()
        for key in endpoint_keys:
            if key.lower() == normalized:
                return key
        for key in endpoint_keys:
            if normalized in key.lower() or key.lower() in normalized:
                return key
    return "management"

updated_count = 0

for root_dir, _, files in os.walk(dashboard_dir):
    for file in files:
        if file == "page.tsx":
            filepath = os.path.join(root_dir, file)
            with open(filepath, "r") as f:
                content = f.read()
            
            # Identify stub pages with the p-10 border format
            if "<div className=\"p-10 border border-" in content and "GenericDataTable" not in content:
                match_h2 = re.search(r"<h2[^>]*>([^<]+)</h2>", content)
                match_p = re.search(r"<p className=\"text-gray-400\">([^<]+)</p>", content)
                
                title = match_h2.group(1) if match_h2 else os.path.basename(root_dir).title()
                desc = match_p.group(1) if match_p else "Auto-generated production-grade data table powered by useAutoApi."
                
                rel_path = os.path.relpath(root_dir, dashboard_dir)
                parts = rel_path.split(os.sep)
                endpoint = get_best_endpoint(parts)
                
                new_content = f"""'use client';
import React from 'react';
import {{ Breadcrumbs }} from '@/components/ui/Breadcrumbs';
import {{ GenericDataTable }} from '@/components/ui/GenericDataTable';

export default function Page() {{
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={{[{{label:'Dashboard'}}, {{label:'{parts[0]}'}} , {{label:'{title}'}}]}} />
      <GenericDataTable 
        endpointKey="{endpoint}" 
        title="{title}" 
        description="{desc}"
      />
    </div>
  );
}}
"""
                with open(filepath, "w") as f:
                    f.write(new_content)
                updated_count += 1

print(f"Successfully upgraded {updated_count} additional stub pages to Production Grade AutoDataTables!")
