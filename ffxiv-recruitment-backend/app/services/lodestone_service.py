import requests
from bs4 import BeautifulSoup
import re

class LodestoneService:
    """Service for fetching FFXIV Lodestone character data"""
    
    BASE_URL = "https://na.finalfantasyxiv.com/lodestone/character"
    
    @staticmethod
    def fetch_character_data(character_id):
        """
        Fetch character data from Lodestone
        
        Args:
            character_id: The Lodestone character ID (numeric)
            
        Returns:
            dict with character data or error message
        """
        try:
            url = f"{LodestoneService.BASE_URL}/{character_id}/"
            
            # Add timeout and user agent to avoid blocking
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract character name
            character_name = LodestoneService._extract_character_name(soup)
            
            # Extract server
            server = LodestoneService._extract_server(soup)
            
            # Extract data center
            data_center = LodestoneService._extract_data_center(server)
            
            # Extract classes/jobs
            jobs = LodestoneService._extract_jobs(soup)

            char_deets = LodestoneService._extract_character_details(soup)
            
            # Demographics
            race = char_deets["race"]
            sub_race = char_deets["sub_race"]
            gender = char_deets['gender']

            # Extract grand company
            grand_company = char_deets["grand_company"]
            grand_company_rank = char_deets["grand_company_rank"]
            
            # Extract free company
            free_company = char_deets["free_company"]

            
            return {
                'success': True,
                'character_id': character_id,
                'character_name': character_name,
                'server': server,
                'data_center': data_center,
                'jobs': jobs,
                'grand_company': grand_company,
                'grand_company_rank' : grand_company_rank,
                'free_company': free_company,
                'race': race,
                'sub_race': sub_race,
                'gender' : gender
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Failed to fetch Lodestone data: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error parsing Lodestone data: {str(e)}'
            }
    
    @staticmethod
    def _extract_character_name(soup):
        """Extract character name from page"""
        try:
            # Character name is in the header
            name_elem = soup.find('p', class_='frame__chara__name')
            if name_elem:
                return name_elem.text.strip()
        except:
            pass
        return None
    
    @staticmethod 
    def _extract_character_details(soup : BeautifulSoup):
        try:
            ret = {}
            character_info = soup.find('div', class_='character__profile__data')
            character_info = [s.text for s in character_info.find_all('p', class_='character-block__name')]
            race_gender = re.sub(r'(?<!^)([A-Z])', r' \1', character_info[0]).split("/")
            ret["race"] = race_gender[0].strip().split(" ")[0]
            ret["sub_race"] = race_gender[0].strip().split(" ")[1]
            ret["gender"] = "Female" if race_gender[1].strip() == "♀" else "Male"
            ret["grand_company"] = character_info[3].split("/")[0].strip()
            ret["grand_company_rank"] = character_info[3].split("/")[1].strip()
            ret["free_company"] = soup.find('div', class_="character__freecompany__name").text.replace("Free Company", "")
            return ret
        except:
            pass
        return None

    @staticmethod
    def _extract_server(soup):
        """Extract server from page"""
        try:
            # Server is typically after the character name
            server_elem = soup.find('p', class_='frame__chara__world')
            if server_elem:
                text = server_elem.text.strip()
                text_arr = text.split()
                return text_arr[0]
        except:
            pass
        return None
    
    @staticmethod
    def _extract_data_center(server):
        """Map server to data center"""
        # North America data centers
        data_center_map = {
            # Aether
            'Adamantoise': 'Aether',
            'Cactuar': 'Aether',
            'Faerie': 'Aether',
            'Gilgamesh': 'Aether',
            'Jenova': 'Aether',
            'Midgardsormr': 'Aether',
            'Sargatanas': 'Aether',
            'Siren': 'Aether',
            # Crystal
            'Balmung': 'Crystal',
            'Brynhildr': 'Crystal',
            'Coeurl': 'Crystal',
            'Diabolos': 'Crystal',
            'Goblin': 'Crystal',
            'Malboro': 'Crystal',
            'Mateus': 'Crystal',
            'Zalera': 'Crystal',
            # Primal
            'Behemoth': 'Primal',
            'Excalibur': 'Primal',
            'Exodus': 'Primal',
            'Famfrit': 'Primal',
            'Hyperion': 'Primal',
            'Lamia': 'Primal',
            'Leviathan': 'Primal',
            'Ultros': 'Primal',
            # Dynamis
            'Halicarnassus': 'Dynamis',
            'Maduin': 'Dynamis',
            'Marilith': 'Dynamis',
            'Seraph': 'Dynamis'
        }
        
        return data_center_map.get(server, None)
    
    @staticmethod
    def _extract_jobs(soup):
        """Extract unlocked jobs/classes"""
        try:
            jobs = dict()
            job_elements = soup.find('div', class_='character__profile__detail')
            tanks = dict()
            child_elements = job_elements.findChildren()
            job_level_strings = list(job_elements.find('div', class_= 'js__character_toggle').stripped_strings)
            tank_job_levels = job_level_strings[:4]
            healer_job_levels = job_level_strings[4:8]
            melee_dps_job_levels = job_level_strings[8:14]
            ranged_dps_job_levels = job_level_strings[14:17]
            caster_dps_job_levels = job_level_strings[17:22]
            crafter_job_levels = job_level_strings[22:30]
            gatherer_job_levels = job_level_strings[30:33]
            job_list = ["PLD", "WAR", "DRK", "GNB", "WHM", "SCH", "AST", "SGE", "DRG", "MNK", "NIN", "SAM", "RPR", "VPR", "BRD", "MCH", "DNC", "BLM", "SMN", "RDM", "PCT", "BLU", "CRP", "BSM", "ARM", "GSM", "LTW", "WVR", "ALC", "CUL", "MIN", "BTN", "FSH"]
            ret = {"tanks" : {}, "healers" : {}, "melee_dps" : {}, "ranged_dps" : {}, "magical_dps" : {}, "crafters" : {}, "gatherers": {}}
            for i in range(len(job_level_strings)):
                if i < 4:
                    ret["tanks"][job_list[i]] = job_level_strings[i]
                elif i < 8:
                    ret["healers"][job_list[i]] = job_level_strings[i]
                elif i < 14:
                    ret["melee_dps"][job_list[i]] = job_level_strings[i]
                elif i < 17:
                    ret["ranged_dps"][job_list[i]] = job_level_strings[i]
                elif i < 22:
                    ret["magical_dps"][job_list[i]] = job_level_strings[i]
                elif i < 30:
                    ret["crafters"][job_list[i]] = job_level_strings[i]
                elif i < 33:
                    ret["gatherers"][job_list[i]] = job_level_strings[i]
            return ret
        except:
            pass
        return []
    
    @staticmethod
    def _extract_grand_company(soup):
        """Extract Grand Company information"""
        try:
            gc_elem = soup.find('div', class_='character__grand_company')
            if gc_elem:
                return gc_elem.text.strip()
        except:
            pass
        return None
    
    @staticmethod
    def _extract_free_company(soup):
        """Extract Free Company information"""
        try:
            fc_elem = soup.find('div', class_='character__free_company')
            if fc_elem:
                fc_link = fc_elem.find('a')
                if fc_link:
                    return fc_link.text.strip()
        except:
            pass
        return None