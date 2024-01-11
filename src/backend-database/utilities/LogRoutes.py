def log_routes(app):
    with open('routes.log', 'w+') as f:
        f.writelines(app.url_map.__str__())
