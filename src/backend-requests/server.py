from flask import Flask, request, make_response
from flask_cors import CORS, cross_origin
from SPARQLWrapper import SPARQLWrapper, JSON
import requests
import ssl
import urllib.parse
import json

ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, methods=['GET'])
#CORS(app)

def build_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

@app.route('/sparql', methods=['GET'])
@cross_origin()
def sparql():
    if request.method == 'OPTIONS': 
        return build_preflight_response()
    else:
        try:
            #print("REQUEST incoming sparql")
            #print(request)
            #query = request.args.get('query')
            url = request.args.get('url')
            query = request.args.get('query')

            #print("REQUEST ARGS")
            #print(request.args)
        # print("QUERY")
            #print(query) #encode the query? sparql wrapper?

            encoded_query = urllib.parse.quote(query)
            #url = f'https://orkg.org/triplestore?query={encoded_query}'
            format_url = f'{url}?query={encoded_query}'
            #print("Anfrage URL ")
            #print(format_url)

            headers = {
                'Accept': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000'
            }
            response = requests.get(format_url, headers=headers)

            if response.status_code == 200:
                try:
                    #print("ANTWORT ERHALTEN:")
                    #print(response.content)
                    data = response.json()
                    # Jetzt kannst du die Daten weiterverarbeiten
                except json.JSONDecodeError as e:
                    print("Fehler beim Dekodieren der JSON-Antwort:", str(e))
            else:
                print("Fehler beim Senden der Anfrage. Statuscode:", response.status_code)

            #print("RESPONSE")
            #print(type(response.content))

            data = response.json()
            #data = json.loads(response.content.decode('utf-8'))
            #print("DATA")
            #print(data)
            #print(type(data))

            return data
            
            #return data
        except Exception as e:
            return {'error': str(e)}, 500
    
@app.route('/matomo', methods=['GET'])
@cross_origin(origin='*')
def matomo():
    try:
        # Forward the request to Matomo
        print("REQUEST incoming matomo")
        matomo_url = request.args.get('url')
        headers = {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000'
        }
        response = requests.get(matomo_url, headers=headers)
        print("MATOMO URL")
        print(response)
        if response.status_code == 200:
            data = response.json()
            print(data)
            return data
        else:
            return {'error': 'Matomo request failed.'}, response.status_code
    except Exception as e:
        print("Error:", str(e))
        return {'error': str(e)}, 500


if __name__ == '__main__':
    app.run()