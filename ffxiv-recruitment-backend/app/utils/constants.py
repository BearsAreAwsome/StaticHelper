# FFXIV Game Constants

# Data Centers (North America)
DATA_CENTERS = ['Aether', 'Crystal', 'Primal', 'Dynamis']

# Servers by Data Center
SERVERS = {
    'Aether': ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren'],
    'Crystal': ['Balmung', 'Brynhildr', 'Coeurl', 'Diabolos', 'Goblin', 'Malboro', 'Mateus', 'Zalera'],
    'Primal': ['Behemoth', 'Excalibur', 'Exodus', 'Famfrit', 'Hyperion', 'Lamia', 'Leviathan', 'Ultros'],
    'Dynamis': ['Halicarnassus', 'Maduin', 'Marilith', 'Seraph']
}

# Content Types
CONTENT_TYPES = [
    'savage',
    'ultimate',
    'extreme',
    'chaotic',
    'criterion',
    'alliance_raid',
    'normal_raid',
    'dungeon'
]

# Roles
ROLES = ['Tank', 'Healer', 'DPS']

# Jobs by Role
JOBS = {
    'Tank': ['Paladin', 'Warrior', 'Dark Knight', 'Gunbreaker'],
    'Healer': ['White Mage', 'Scholar', 'Astrologian', 'Sage'],
    'DPS': [
        'Monk', 'Dragoon', 'Ninja', 'Samurai', 'Reaper', 'Viper',  # Melee
        'Bard', 'Machinist', 'Dancer',  # Physical Ranged
        'Black Mage', 'Summoner', 'Red Mage', 'Pictomancer'  # Magical Ranged
    ]
}

# Voice Chat Platforms
VOICE_CHAT_PLATFORMS = ['Discord', 'Teamspeak', 'Mumble', 'In-game', 'Other']

# Listing States
LISTING_STATES = ['private', 'recruiting', 'filled']