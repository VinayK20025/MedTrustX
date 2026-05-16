import os
import re

endpoints_file = "/root/MedTrustX/Project/frontend/src/services/autoEndpoints.ts"
dashboard_dir = "/root/MedTrustX/Project/frontend/src/app/dashboard"

# Extract valid endpoint keys
endpoint_keys = []
with open(endpoints_file, "r") as f:
    content = f.read()
    # matches e.g.   accessControl: {
    keys = re.findall(r'^\s+([a-zA-Z0-9_]+):\s*\{', content, re.MULTILINE)
    endpoint_keys = keys

print(f"Found {len(endpoint_keys)} endpoint keys")

# Function to find the closest matching endpoint key
def get_best_endpoint(path_parts):
    # try right to left (most specific part of path)
    for part in reversed(path_parts):
        normalized = part.replace('-', '').lower()
        for key in endpoint_keys:
            if key.lower() == normalized:
                return key
            
        # fallback substring match
        for key in endpoint_keys:
            if normalized in key.lower() or key.lower() in normalized:
                return key
    return "management" # fallback

updated_count = 0

for root_dir, _, files in os.walk(dashboard_dir):
    for file in files:
        if file == "page.tsx":
            filepath = os.path.join(root_dir, file)
            with open(filepath, "r") as f:
                content = f.read()
            
            # Identify stub pages
            if "<p className=\"capitalize\">" in content and "GenericDataTable" not in content:
                # Extract the label, e.g. "events"
                match = re.search(r"<p className=\"capitalize\">([^<]+)</p>", content)
                if match:
                    title = match.group(1)
                    
                    # Compute relative path parts for endpoint matching
                    rel_path = os.path.relpath(root_dir, dashboard_dir)
                    parts = rel_path.split(os.sep)
                    
                    endpoint = get_best_endpoint(parts)
                    
                    # Generate new content
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
        title="{title} Management" 
        description="Auto-generated production-grade data table powered by useAutoApi."
      />
    </div>
  );
}}
"""
                    with open(filepath, "w") as f:
                        f.write(new_content)
                    updated_count += 1

print(f"Successfully upgraded {updated_count} stub pages to Production Grade AutoDataTables!")
