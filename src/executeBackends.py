import subprocess
import os

script_directory = os.path.dirname(os.path.abspath(__file__))

files_to_execute = [
    os.path.join(script_directory, 'backend-database', 'FlaskServer.py'),
    os.path.join(script_directory, 'backend-requests', 'server.py')
]

processes = []

# start a subprocess for each file
for file in files_to_execute:
    try:
        process = subprocess.Popen(['python', file], cwd=script_directory)
        processes.append(process)
    except Exception as e:
        print(f"Error executing {file}: {e}")

for process in processes:
    process.wait()
