from flask import Flask, request
from flask_cors import CORS, cross_origin
from SPARQLWrapper import SPARQLWrapper, JSON
import requests
import ssl
import urllib.parse
import json

ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)
CORS(app)


@app.route('/sparql', methods=['GET'])
@cross_origin()
def sparql():
    try:
        print("REQUEST incoming")
        print(request)
        #query = request.args.get('query')
        url = request.args.get('url')
        query = request.args.get('query')

        print("REQUEST ARGS")
        print(request.args)
        print("QUERY")
        #print(query) #encode the query? sparql wrapper?

        encoded_query = urllib.parse.quote(query)
        #url = f'https://orkg.org/triplestore?query={encoded_query}'
        format_url = f'{url}?query={encoded_query}'
        print("Anfrage URL ")
        print(format_url)

        headers = {
            'Accept': 'application/json'
        }
        response = requests.get(format_url, headers=headers)

        if response.status_code == 200:
            try:
                print("ANTWORT ERHALTEN:")
                print(response.content)
                data = response.json()
                # Jetzt kannst du die Daten weiterverarbeiten
            except json.JSONDecodeError as e:
                print("Fehler beim Dekodieren der JSON-Antwort:", str(e))
        else:
            print("Fehler beim Senden der Anfrage. Statuscode:", response.status_code)

        print("RESPONSE")
        print(type(response.content))

        data = response.json()
        #data = json.loads(response.content.decode('utf-8'))
        print("DATA")
        print(data)
        print(type(data))

        return data
        
        #return data
    except Exception as e:
        print("shit")
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run()