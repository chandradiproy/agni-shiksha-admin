import os

# Base folders
base_dirs = [
    "assets",
    "components/ui",
    "components/layout",
    "components/guard",
    "config",
    "hooks",
    "lib",
    "routes",
    "store",
    "types",
    "utils",
]

# Feature modules
features = [
    "auth",
    "dashboard",
    "content",
    "current-affairs",
    "moderation",
    "gamification",
    "users",
]

# Create base directories
for d in base_dirs:
    os.makedirs(d, exist_ok=True)

# Create feature structure
for feature in features:
    base_path = os.path.join("features", feature)

    os.makedirs(os.path.join(base_path, "components"), exist_ok=True)
    os.makedirs(os.path.join(base_path, "services"), exist_ok=True)
    os.makedirs(os.path.join(base_path, "types"), exist_ok=True)

    # create index.ts
    index_file = os.path.join(base_path, "index.ts")
    with open(index_file, "w") as f:
        f.write(f"// {feature} feature entry\n")

print("Project folder structure created successfully.")