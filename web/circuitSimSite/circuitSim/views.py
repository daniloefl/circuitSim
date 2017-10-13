from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse



def index(request):
    template = loader.get_template('circuitSim/index.html')
    return HttpResponse(template.render(request))

def run(request):
    data = {'img': 'Test'};
    return JsonResponse(data);
