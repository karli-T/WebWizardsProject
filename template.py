# functions mostly similar to Jesse's Code
def create_template(collection,style):

    with open('templates/index.html') as html:
        template = html.read()
        template = template.replace()
        template = find_loop(template,collection)
        return template
