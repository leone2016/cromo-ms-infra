### Generar la clave privada (2048 bits)
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

### Generar la clave pública a partir de la clave privada
openssl rsa -pubout -in private_key.pem -out public_key.pem

### Generar base64 a partir de la clave privada
base64 -w 0 private_key.pem > private_key_base64.txt

### Generar base64 a partir de la clave publica
base64 -w 0 public_key.pem > public_key_base64.txt

### decode base64
echo 'VGhpcyBpcyBhIGJhc2U2NCBlbmNvZGVkIHN0cmluZw==' | base64 -d
