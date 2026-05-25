import os
import uuid
from django.utils import timezone
from django.utils.text import slugify

def avatar_upload_path(instance, filename):
    extension = os.path.splitext(filename)[1].lower()
    role = instance.role.lower()
    year = timezone.now().year
    new_filename = f"{instance.id}{extension}"
    return f"avatars/{role}/{year}/{new_filename}"

WILAYA_CHOICES = [
    ('adrar', 'Adrar'),
    ('chlef', 'Chlef'),
    ('laghouat', 'Laghouat'),
    ('oum_el_bouaghi', 'Oum El Bouaghi'),
    ('batna', 'Batna'),
    ('bejaia', 'Béjaïa'),
    ('biskra', 'Biskra'),
    ('bechar', 'Béchar'),
    ('blida', 'Blida'),
    ('bouira', 'Bouira'),
    ('tamanrasset', 'Tamanrasset'),
    ('tebessa', 'Tébessa'),
    ('tlemcen', 'Tlemcen'),
    ('tiaret', 'Tiaret'),
    ('tizi_ouzou', 'Tizi Ouzou'),
    ('alger', 'Alger'),
    ('djelfa', 'Djelfa'),
    ('jijel', 'Jijel'),
    ('setif', 'Sétif'),
    ('saida', 'Saïda'),
    ('skikda', 'Skikda'),
    ('sidi_bel_abbes', 'Sidi Bel Abbès'),
    ('annaba', 'Annaba'),
    ('guelma', 'Guelma'),
    ('constantine', 'Constantine'),
    ('medea', 'Médéa'),
    ('mostaganem', 'Mostaganem'),
    ('msila', 'M\'Sila'),
    ('mascara', 'Mascara'),
    ('ouargla', 'Ouargla'),
    ('oran', 'Oran'),
    ('el_bayadh', 'El Bayadh'),
    ('illizi', 'Illizi'),
    ('bordj_bou_arreridj','Bordj Bou Arréridj'),
    ('boumerdes', 'Boumerdès'),
    ('el_tarf', 'El Tarf'),
    ('tindouf', 'Tindouf'),
    ('tissemsilt', 'Tissemsilt'),
    ('el_oued', 'El Oued'),
    ('khenchela', 'Khenchela'),
    ('souk_ahras', 'Souk Ahras'),
    ('tipaza', 'Tipaza'),
    ('mila', 'Mila'),
    ('ain_defla', 'Aïn Defla'),
    ('naama', 'Naâma'),
    ('ain_temouchent', 'Aïn Témouchent'),
    ('ghardaia', 'Ghardaïa'),
    ('relizane', 'Relizane'),
]
