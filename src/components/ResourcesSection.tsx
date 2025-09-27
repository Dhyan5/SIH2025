import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ExternalLink, Phone, MapPin, Heart, Users, BookOpen, Stethoscope, Building, Globe, IndianRupee, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';

const indianHospitals = [
  {
    name: "All India Institute of Medical Sciences (AIIMS), New Delhi",
    city: "New Delhi",
    specialization: "Geriatric Medicine & Neurology",
    phone: "+91-11-2658-8500",
    website: "aiims.edu",
    services: ["Memory Clinic", "Cognitive Assessment", "Neuropsychological Testing", "Family Counseling"],
    type: "Government"
  },
  {
    name: "National Institute of Mental Health and Neuro Sciences (NIMHANS)",
    city: "Bangalore",
    specialization: "Neurology & Psychiatry",
    phone: "+91-80-2699-5000",
    website: "nimhans.ac.in",
    services: ["Dementia Clinic", "Research Programs", "Caregiver Training", "Memory Assessment"],
    type: "Government"
  },
  {
    name: "Christian Medical College (CMC)",
    city: "Vellore",
    specialization: "Geriatric Medicine",
    phone: "+91-416-228-1000",
    website: "cmch-vellore.edu",
    services: ["Memory Disorders Clinic", "Cognitive Rehabilitation", "Family Support", "Long-term Care"],
    type: "Private"
  },
  {
    name: "Kokilaben Dhirubhai Ambani Hospital",
    city: "Mumbai",
    specialization: "Neurology & Memory Care",
    phone: "+91-22-4269-6969",
    website: "kokilabenhospital.com",
    services: ["Advanced Memory Clinic", "Brain Health Program", "Caregiver Support", "Rehabilitation"],
    type: "Private"
  },
  {
    name: "Apollo Hospitals",
    city: "Chennai, Hyderabad, Delhi",
    specialization: "Neurology & Geriatrics",
    phone: "+91-44-2829-3333",
    website: "apollohospitals.com",
    services: ["Memory Assessment", "Neuropsychological Testing", "Family Counseling", "Day Care"],
    type: "Private"
  },
  {
    name: "Fortis Hospital",
    city: "Multiple Cities",
    specialization: "Neurology & Mental Health",
    phone: "+91-124-496-2200",
    website: "fortishealthcare.com",
    services: ["Cognitive Testing", "Dementia Care", "Support Groups", "Rehabilitation"],
    type: "Private"
  },
  {
    name: "Postgraduate Institute of Medical Education and Research (PGIMER)",
    city: "Chandigarh",
    specialization: "Neurology & Geriatrics",
    phone: "+91-172-275-6565",
    website: "pgimer.edu.in",
    services: ["Memory Clinic", "Research Trials", "Training Programs", "Community Outreach"],
    type: "Government"
  },
  {
    name: "Sanjay Gandhi Post Graduate Institute (SGPGI)",
    city: "Lucknow",
    specialization: "Neurology",
    phone: "+91-522-249-4000",
    website: "sgpgi.ac.in",
    services: ["Dementia Assessment", "Family Counseling", "Research Programs", "Education"],
    type: "Government"
  }
];

const indianOrganizations = [
  {
    name: "Alzheimer's and Related Disorders Society of India (ARDSI)",
    description: "Leading organization for dementia care and awareness in India",
    phone: "+91-80-2668-4709",
    website: "ardsi.org",
    headquarters: "Bangalore",
    services: ["Support Groups", "Caregiver Training", "Awareness Programs", "Day Care Centers"]
  },
  {
    name: "Dementia India Alliance",
    description: "Research and advocacy organization for dementia in India",
    phone: "+91-80-2293-2556",
    website: "dementiaindia.org",
    headquarters: "Bangalore",
    services: ["Research Support", "Policy Advocacy", "Professional Training", "Public Awareness"]
  },
  {
    name: "Indian Association for the Study of Pain (IASP)",
    description: "Healthcare professional organization with dementia focus",
    phone: "+91-11-2685-8384",
    website: "iaspindia.org",
    headquarters: "New Delhi",
    services: ["Professional Education", "Research Programs", "Clinical Guidelines", "Conferences"]
  },
  {
    name: "Silver Innings Foundation",
    description: "Elderly care and dementia support organization",
    phone: "+91-80-4080-4925",
    website: "silverinnings.com",
    headquarters: "Bangalore",
    services: ["Home Care", "Day Care Programs", "Training Workshops", "Family Support"]
  }
];

const governmentSchemes = [
  {
    name: "Pradhan Mantri Jan Arogya Yojana (Ayushman Bharat)",
    description: "Health insurance scheme covering dementia treatment",
    coverage: "₹5 lakhs per family per year",
    eligibility: "Low-income families as per SECC database",
    benefits: ["Hospital Treatment", "Diagnostic Tests", "Medications", "Follow-up Care"]
  },
  {
    name: "National Programme for Healthcare of Elderly (NPHCE)",
    description: "Dedicated healthcare program for elderly including dementia care",
    coverage: "Subsidized healthcare services",
    eligibility: "All elderly citizens (60+ years)",
    benefits: ["Specialized Clinics", "Home Care", "Rehabilitation", "Caregiver Training"]
  },
  {
    name: "Central Government Health Scheme (CGHS)",
    description: "Healthcare scheme for central government employees",
    coverage: "Comprehensive medical coverage",
    eligibility: "Central govt employees and pensioners",
    benefits: ["OPD Treatment", "Hospitalization", "Specialist Consultation", "Medicines"]
  },
  {
    name: "Employee State Insurance (ESI)",
    description: "Medical care for organized sector workers",
    coverage: "Free medical treatment",
    eligibility: "Workers earning up to ₹25,000/month",
    benefits: ["Medical Treatment", "Cash Benefits", "Rehabilitation", "Family Coverage"]
  }
];

const regionalServices = [
  {
    region: "North India",
    cities: ["Delhi", "Chandigarh", "Lucknow", "Jaipur"],
    services: [
      { name: "AIIMS Memory Clinic", location: "New Delhi", type: "Assessment & Treatment" },
      { name: "PGIMER Geriatric Clinic", location: "Chandigarh", type: "Specialized Care" },
      { name: "SGPGI Neurology Dept", location: "Lucknow", type: "Research & Care" },
      { name: "SMS Medical College", location: "Jaipur", type: "Public Healthcare" }
    ]
  },
  {
    region: "South India",
    cities: ["Bangalore", "Chennai", "Hyderabad", "Kochi"],
    services: [
      { name: "NIMHANS Dementia Clinic", location: "Bangalore", type: "Specialized Research" },
      { name: "Apollo Memory Care", location: "Chennai", type: "Private Healthcare" },
      { name: "NIMS Neurology", location: "Hyderabad", type: "Government Care" },
      { name: "Aster Medcity", location: "Kochi", type: "Advanced Treatment" }
    ]
  },
  {
    region: "West India",
    cities: ["Mumbai", "Pune", "Ahmedabad", "Goa"],
    services: [
      { name: "Kokilaben Hospital", location: "Mumbai", type: "Premium Care" },
      { name: "Ruby Hall Clinic", location: "Pune", type: "Comprehensive Care" },
      { name: "Sterling Hospitals", location: "Ahmedabad", type: "Multi-specialty" },
      { name: "Goa Medical College", location: "Goa", type: "Public Healthcare" }
    ]
  },
  {
    region: "East India",
    cities: ["Kolkata", "Bhubaneswar", "Guwahati"],
    services: [
      { name: "SSKM Hospital", location: "Kolkata", type: "Government Care" },
      { name: "Kalinga Hospital", location: "Bhubaneswar", type: "Private Care" },
      { name: "GMCH Neurology", location: "Guwahati", type: "Regional Center" }
    ]
  }
];

const emergencyContacts = [
  {
    service: "National Emergency Helpline",
    number: "112",
    description: "All emergency services including medical"
  },
  {
    service: "ARDSI National Helpline",
    number: "+91-80-2668-4709",
    description: "Dementia support and information"
  },
  {
    service: "Senior Citizen Helpline",
    number: "14567",
    description: "Dedicated support for elderly citizens"
  },
  {
    service: "Mental Health Helpline (Vandrevala Foundation)",
    number: "+91-99996-66555",
    description: "24/7 mental health support"
  },
  {
    service: "Helpline for Elderly (HelpAge India)",
    number: "+91-11-4168-8955",
    description: "Support and assistance for seniors"
  }
];

export function ResourcesSection() {
  const [selectedRegion, setSelectedRegion] = useState("North India");
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2>{t('resources.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('resources.description')}
            </p>
            <div className="flex gap-3">
              <Button>
                <Phone className="h-4 w-4 mr-2" />
                {t('resources.callHelpline')}
              </Button>
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                {t('resources.findHospitals')}
              </Button>
            </div>
          </div>
          <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBob3NwaXRhbCUyMGRvY3RvcnxlbnwxfHx8fDE3NTg4MDcyODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Indian healthcare professionals"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Tabs for different resource categories */}
      <Tabs defaultValue="hospitals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hospitals" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {t('resources.tabs.hospitals')}
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('resources.tabs.organizations')}
          </TabsTrigger>
          <TabsTrigger value="schemes" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('resources.tabs.schemes')}
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('resources.tabs.regional')}
          </TabsTrigger>
        </TabsList>

        {/* Hospitals Tab */}
        <TabsContent value="hospitals" className="space-y-6">
          <div className="mb-6">
            <h3>{t('resources.hospitalsTabTitle')}</h3>
            <p className="text-muted-foreground">
              {t('resources.hospitalsTabDescription')}
            </p>
          </div>
          <div className="grid gap-4">
            {indianHospitals.map((hospital, index) => (
              <Card key={index} className="relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={hospital.type === 'Government' ? 'default' : 'secondary'}>
                    {hospital.type}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="pr-20">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      {hospital.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {hospital.city} • {hospital.specialization}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{hospital.website}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hospital.services.map((service, serviceIndex) => (
                        <Badge key={serviceIndex} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <div className="mb-6">
            <h3>{t('resources.organizationsTabTitle')}</h3>
            <p className="text-muted-foreground">
              {t('resources.organizationsTabDescription')}
            </p>
          </div>
          <div className="grid gap-4">
            {indianOrganizations.map((org, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        {org.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {org.description}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-1">
                        Headquarters: {org.headquarters}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{org.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{org.website}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {org.services.map((service, serviceIndex) => (
                        <Badge key={serviceIndex} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Government Schemes Tab */}
        <TabsContent value="schemes" className="space-y-6">
          <div className="mb-6">
            <h3>{t('resources.schemesTabTitle')}</h3>
            <p className="text-muted-foreground">
              {t('resources.schemesTabDescription')}
            </p>
          </div>
          <div className="grid gap-4">
            {governmentSchemes.map((scheme, index) => (
              <Card key={index} className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {scheme.name}
                  </CardTitle>
                  <CardDescription>{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium">Coverage: {scheme.coverage}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Eligibility: </span>
                      {scheme.eligibility}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scheme.benefits.map((benefit, benefitIndex) => (
                        <Badge key={benefitIndex} variant="outline" className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Regional Services Tab */}
        <TabsContent value="regional" className="space-y-6">
          <div className="mb-6">
            <h3>{t('resources.regionalTabTitle')}</h3>
            <p className="text-muted-foreground">
              {t('resources.regionalTabDescription')}
            </p>
          </div>
          
          {/* Region Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {regionalServices.map((region) => (
              <Button
                key={region.region}
                variant={selectedRegion === region.region ? "default" : "outline"}
                onClick={() => setSelectedRegion(region.region)}
                className="text-sm"
              >
                {region.region}
              </Button>
            ))}
          </div>

          {/* Selected Region Services */}
          {regionalServices
            .filter(region => region.region === selectedRegion)
            .map((region) => (
              <Card key={region.region}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {region.region} Healthcare Services
                  </CardTitle>
                  <CardDescription>
                    Available in: {region.cities.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {region.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="text-sm">{service.name}</h4>
                          <p className="text-xs text-muted-foreground">{service.location}</p>
                        </div>
                        <Badge variant="outline">{service.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Emergency Contacts */}
      <section>
        <div className="mb-6">
          <h3>{t('resources.helplineNumbers')}</h3>
          <p className="text-muted-foreground">
            {t('resources.helplineDesc')}
          </p>
        </div>
        <div className="grid gap-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 dark:border-border/50">
              <div>
                <h4>{contact.service}</h4>
                <p className="text-sm text-muted-foreground">{contact.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg text-green-700 dark:text-green-400 bg-white dark:bg-background px-2 py-1 rounded border dark:border-border">
                  {contact.number}
                </span>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Resources */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Research Centers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Indian Research Centers
            </CardTitle>
            <CardDescription>Leading research institutions for dementia studies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">National Brain Research Centre (NBRC)</div>
              <div className="text-muted-foreground">Manesar, Haryana • Neuroscience Research</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Indian Institute of Science (IISc)</div>
              <div className="text-muted-foreground">Bangalore • Cognitive Science</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Centre for Brain Research (CBR)</div>
              <div className="text-muted-foreground">Bangalore • Neurodegeneration Studies</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Tata Institute of Fundamental Research</div>
              <div className="text-muted-foreground">Mumbai • Neurobiology Research</div>
            </div>
          </CardContent>
        </Card>

        {/* Support Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Support Group Networks
            </CardTitle>
            <CardDescription>Community support across Indian cities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">ARDSI Chapters</div>
              <div className="text-muted-foreground">Available in 25+ cities • Family Support</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Silver Innings Support Groups</div>
              <div className="text-muted-foreground">Bangalore, Chennai, Pune • Weekly Meetings</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Nightingales Centre for Ageing</div>
              <div className="text-muted-foreground">Bangalore • Caregiver Training</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Care24 Support Network</div>
              <div className="text-muted-foreground">Mumbai, Delhi, Bangalore • Home Care</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Indian-Specific Action Plan */}
      <section>
        <Card className="bg-gradient-to-br from-orange-50 to-green-50 dark:from-orange-950/20 dark:to-green-950/20 border-orange-200 dark:border-orange-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-orange-600" />
              {t('resources.actionPlanTitle')}
            </CardTitle>
            <CardDescription>
              {t('resources.actionPlanDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</div>
                <div>
                  <h4>Consult Family Doctor or Geriatrician</h4>
                  <p className="text-sm text-muted-foreground">
                    Start with your family physician or visit a geriatrician at nearby AIIMS, PGIMER, or private hospitals
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</div>
                <div>
                  <h4>Check Government Scheme Eligibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify coverage under Ayushman Bharat, CGHS, or state health schemes for diagnostic tests
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">3</div>
                <div>
                  <h4>Connect with ARDSI Local Chapter</h4>
                  <p className="text-sm text-muted-foreground">
                    Join family support groups and caregiver training programs in your city
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">4</div>
                <div>
                  <h4>Explore Home Care Options</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider day care centers or home nursing services while maintaining family involvement
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">5</div>
                <div>
                  <h4>Financial and Legal Planning</h4>
                  <p className="text-sm text-muted-foreground">
                    Understand elder care laws, insurance options, and consider setting up power of attorney
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/70 rounded-lg border border-orange-200">
              <h4 className="text-sm mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                Quick Access Numbers
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>ARDSI Helpline: <span className="font-mono">+91-80-2668-4709</span></div>
                <div>National Emergency: <span className="font-mono">112</span></div>
                <div>Senior Citizen Helpline: <span className="font-mono">14567</span></div>
                <div>Mental Health Support: <span className="font-mono">+91-99996-66555</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}