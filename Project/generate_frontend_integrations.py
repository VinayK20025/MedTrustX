import os
import re

SERVICES_DIR = "/root/MedTrustX/Project/services"
FRONTEND_DIR = "/root/MedTrustX/Project/frontend/src"

def to_camel_case(snake_str):
    components = snake_str.split('-')
    return components[0] + ''.join(x.title() for x in components[1:])

def main():
    services = []
    for d in os.listdir(SERVICES_DIR):
        if os.path.isdir(os.path.join(SERVICES_DIR, d)) and d.endswith('-service'):
            base_name = d.replace('-service', '')
            if base_name:
                services.append(base_name)
    
    services.sort()

    endpoints_content = [
        "/**",
        " * AUTO-GENERATED MEDTRUSTX ENDPOINTS",
        " * Full integration mapping for all 139+ microservices.",
        " */",
        "export const autoEndpoints = {"
    ]

    for svc in services:
        camel_svc = to_camel_case(svc)
        endpoints_content.append(f"  {camel_svc}: {{")
        endpoints_content.append(f"    list: '/api/v1/{svc}',")
        endpoints_content.append(f"    getById: (id: string) => `/api/v1/{svc}/${{id}}`,")
        endpoints_content.append(f"    create: '/api/v1/{svc}',")
        endpoints_content.append(f"    update: (id: string) => `/api/v1/{svc}/${{id}}`,")
        endpoints_content.append(f"    delete: (id: string) => `/api/v1/{svc}/${{id}}`,")
        endpoints_content.append(f"  }},")

    endpoints_content.append("} as const;")
    endpoints_content.append("")

    with open(os.path.join(FRONTEND_DIR, "services", "autoEndpoints.ts"), "w") as f:
        f.write("\n".join(endpoints_content))

    hooks_content = [
        "/**",
        " * AUTO-GENERATED MEDTRUSTX API HOOKS",
        " * Provides React Query integration for all microservices.",
        " */",
        "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';",
        "import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';",
        "import { autoEndpoints } from '@/services/autoEndpoints';",
        "",
        "export function useAutoApi() {",
        "  const queryClient = useQueryClient();",
        "  return {"
    ]

    for svc in services:
        camel_svc = to_camel_case(svc)
        hooks_content.append(f"    {camel_svc}: {{")
        hooks_content.append(f"      useList: (params?: any) => useQuery({{")
        hooks_content.append(f"        queryKey: ['{camel_svc}', 'list', params],")
        hooks_content.append(f"        queryFn: () => apiGet<any>(autoEndpoints.{camel_svc}.list, {{ params }}),")
        hooks_content.append(f"      }}),")
        hooks_content.append(f"      useGetById: (id: string) => useQuery({{")
        hooks_content.append(f"        queryKey: ['{camel_svc}', 'detail', id],")
        hooks_content.append(f"        queryFn: () => apiGet<any>(autoEndpoints.{camel_svc}.getById(id)),")
        hooks_content.append(f"        enabled: !!id,")
        hooks_content.append(f"      }}),")
        hooks_content.append(f"      useCreate: () => useMutation({{")
        hooks_content.append(f"        mutationFn: (data: any) => apiPost<any>(autoEndpoints.{camel_svc}.create, data),")
        hooks_content.append(f"        onSuccess: () => queryClient.invalidateQueries({{ queryKey: ['{camel_svc}', 'list'] }}),")
        hooks_content.append(f"      }}),")
        hooks_content.append(f"      useUpdate: () => useMutation({{")
        hooks_content.append(f"        mutationFn: ({{ id, data }}: {{ id: string, data: any }}) => apiPut<any>(autoEndpoints.{camel_svc}.update(id), data),")
        hooks_content.append(f"        onSuccess: (_, {{ id }}) => {{")
        hooks_content.append(f"          queryClient.invalidateQueries({{ queryKey: ['{camel_svc}', 'list'] }});")
        hooks_content.append(f"          queryClient.invalidateQueries({{ queryKey: ['{camel_svc}', 'detail', id] }});")
        hooks_content.append(f"        }},")
        hooks_content.append(f"      }}),")
        hooks_content.append(f"      useDelete: () => useMutation({{")
        hooks_content.append(f"        mutationFn: (id: string) => apiDelete<any>(autoEndpoints.{camel_svc}.delete(id)),")
        hooks_content.append(f"        onSuccess: () => queryClient.invalidateQueries({{ queryKey: ['{camel_svc}', 'list'] }}),")
        hooks_content.append(f"      }}),")
        hooks_content.append(f"    }},")

    hooks_content.append("  };")
    hooks_content.append("}")
    hooks_content.append("")

    with open(os.path.join(FRONTEND_DIR, "hooks", "useAutoApi.ts"), "w") as f:
        f.write("\n".join(hooks_content))
    
    print(f"Successfully generated integrations for {len(services)} backend services.")

if __name__ == '__main__':
    main()
