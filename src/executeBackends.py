import subprocess
import os

# Get the directory of the current script
script_directory = os.path.dirname(os.path.abspath(__file__))

# Specify relative paths to the Python files from the script directory
files_to_execute = [
    os.path.join(script_directory, 'backend-database', 'FlaskServer.py'),
    os.path.join(script_directory, 'backend-requests', 'server.py')
]

# Create a list to hold the subprocess objects
processes = []

# Start a subprocess for each file
for file in files_to_execute:
    try:
        # Start the subprocess without waiting for it to complete
        process = subprocess.Popen(['python', file], cwd=script_directory)
        processes.append(process)
    except Exception as e:
        print(f"Error executing {file}: {e}")

# Wait for all subprocesses to complete
for process in processes:
    process.wait()
