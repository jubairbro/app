import urllib.parse
raw_url = "postgresql://postgres:@Jubair121#@db.bkxtgknnxupkennwcfbf.supabase.co:6543/postgres"

def fix_db_url(url: str) -> str:
    if "://" not in url or "sqlite" in url: return url
    prefix, rest = url.split("://", 1)
    if "@" in rest:
        auth, host_path = rest.rsplit("@", 1)
        if ":" in auth:
            user, pwd = auth.split(":", 1)
            # URL encode user and pwd
            user = urllib.parse.quote(urllib.parse.unquote(user))
            pwd = urllib.parse.quote(urllib.parse.unquote(pwd))
            auth = f"{user}:{pwd}"
        rest = f"{auth}@{host_path}"
    return f"{prefix}://{rest}"

print(fix_db_url(raw_url))
