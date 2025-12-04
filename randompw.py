import random
import string

def generate_password(length):
    letters = string.ascii_letters  # a-zA-Z
    password = ''.join(random.choice(letters) for _ in range(length))
    return password

# Contoh penggunaan
for _ in range(1):
    print(generate_password(8))  # ganti 12 dengan panjang yang kamu mau
