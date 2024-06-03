#!/bin/sh

# FTP server details
FTP_HOST='battino.bplaced.net'
FTP_USER='battino'
FTP_PASS='FCQ-cbu2jyv.jfn1bwg'

# File details (relative path)
LOCAL_FILE='index.html'
REMOTE_FILE='/www/index.html'

# Upload the file to the FTP server
ftp -inv $FTP_HOST <<EOF
user $FTP_USER $FTP_PASS
put $LOCAL_FILE $REMOTE_FILE
bye
EOF

echo "Successfully uploaded $LOCAL_FILE to $FTP_HOST/$REMOTE_FILE"