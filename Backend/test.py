import ee
service_account = 'gps-602@geeps-400309.iam.gserviceaccount.com'
credentials = ee.ServiceAccountCredentials(service_account, '.geeps-400309-60423011bde6.json')
ee.Initialize(credentials)