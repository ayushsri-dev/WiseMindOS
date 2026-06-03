import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
	ArrowLeft, 
	ArrowRight,
	Briefcase,
	Target,
	MapPin,
	Clock,
	Filter,
	Code2,
	KanbanSquare,
	Figma,
	BrainCircuit,
	Megaphone,
	Headset
 } from 'lucide-react';
import GradientButton from '../components/GradientButton';
import { motion as Motion } from 'framer-motion';
import Card from '../components/Card';

const jobCategories = [
		'Engineering',
		'Product',
		'Design',
		'Data Science',
		'Marketing',
		'Customer Support',
		'All'
];

const jobRoles = [
    {
        title: 'Software Engineer',
				category: 'Engineering',
				icon: Code2,
        description: 'We are looking for a skilled software engineer to join our team. The ideal candidate will have experience with JavaScript, React, and Node.js.',
        requirements: [
            'Bachelor’s degree in Computer Science or related field',
            '3+ years of experience in software development',
            'Proficiency in JavaScript, React, and Node.js',
            'Strong problem-solving skills',
            'Excellent communication skills'
        ]
    },
    {
        title: 'Product Manager',
				category: 'Product',
				icon: KanbanSquare,
        description: 'We are seeking a product manager to lead the development of our new product line. The ideal candidate will have experience in product management and a strong understanding of the market.',
        requirements: [
            'Bachelor’s degree in Business, Marketing, or related field',
            '5+ years of experience in product management',
            'Strong understanding of market trends and customer needs',
            'Excellent leadership and communication skills',
            'Ability to work cross-functionally with engineering, design, and marketing teams'
        ]
    },
    {
        title: 'UX Designer',
        category: 'Design',
				icon: Figma,
        description: 'We are looking for a talented UX designer to create intuitive and engaging user experiences for our products. The ideal candidate will have experience in user research, wireframing, and prototyping.',
        requirements: [
            'Bachelor’s degree in Design, Human-Computer Interaction, or related field',
            '3+ years of experience in UX design',
            'Proficiency in design tools such as Sketch, Figma, or Adobe XD',
            'Strong portfolio showcasing user-centered design solutions',
            'Excellent communication and collaboration skills'
        ]
    },
    {
        title: 'Data Scientist',
				category: 'Data Science',
				icon: BrainCircuit,
        description: 'We are seeking a data scientist to analyze and interpret complex data sets to help inform business decisions. The ideal candidate will have experience in machine learning, statistical analysis, and data visualization.',
        requirements: [
            'Bachelor’s degree in Data Science, Statistics, or related field',
            '3+ years of experience in data science',
            'Proficiency in programming languages such as Python or R',
            'Experience with machine learning algorithms and statistical analysis',
            'Strong communication skills to present findings to non-technical stakeholders'
        ]
    },
    {
        title: 'Marketing Specialist',
				category: 'Marketing',
				icon: Megaphone,
        description: 'We are looking for a marketing specialist to develop and execute marketing campaigns to promote our products. The ideal candidate will have experience in digital marketing, content creation, and social media management.',
        requirements: [
            'Bachelor’s degree in Marketing, Communications, or related field',
            '3+ years of experience in marketing',
            'Proficiency in digital marketing tools and platforms',
            'Strong content creation and copywriting skills',
            'Experience with social media management and analytics',
            'Excellent communication and project management skills'
        ]
    },
    {
        title: 'Customer Support Specialist',
				category: 'Customer Support',
				icon: Headset,
        description: 'We are seeking a customer support specialist to provide exceptional service to our customers. The ideal candidate will have experience in customer support, strong communication skills, and a passion for helping others.',
        requirements: [
            'Bachelor’s degree in Business, Communications, or related field',
            '2+ years of experience in customer support',
            'Excellent communication and problem-solving skills',
            'Ability to handle difficult customer situations with empathy and professionalism',
            'Experience with customer support software and tools',
            'Strong organizational and time management skills'
        ]
    },
];

const categoryStyles = {
	'Engineering': 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
	'Product': 'border-blue-400/30 bg-blue-500/10 text-blue-300',
	'Design': 'border-pink-400/30 bg-pink-500/10 text-pink-300',
	'Data Science': 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300',
	'Marketing': 'border-purple-400/30 bg-purple-500/10 text-purple-300',
	'Customer Support': 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
};

const cultureHighlights = [
  {
    quarter: '01', // Serves as the step/number tracker
    status: 'Deep Work',
    title: 'Focus-First Spaces',
    summary: 'We build quiet blocks into our schedules. Minimal meeting overhead means you have long, uninterrupted stretches to engineer and design solutions.'
  },
  {
    quarter: '02',
    status: 'Collaboration',
    title: 'Open Source Mindset',
    summary: 'We believe great ideas can come from anyone. We build together transparently, running internal hackathons and open architectural reviews.'
  },
  {
    quarter: '03',
    status: 'Growth',
    title: 'Continuous Learning',
    summary: 'We provide annual learning stipends, coordinate tech talk circles, and give everyone dedicated time to master new tools and machine learning frameworks.'
  },
  {
    quarter: '04',
    status: 'Wellness',
    title: 'Sustainable Velocity',
    summary: 'High performance requires real rest. We support healthy boundary-setting, flexible remote arrangements, and asynchronous communication paths.'
  }
];

const cultureStatusStyles = {
  'Deep Work': 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  'Collaboration': 'border-blue-400/30 bg-blue-500/10 text-blue-300',
  'Growth': 'border-purple-400/30 bg-purple-500/10 text-purple-300',
  'Wellness': 'border-pink-400/30 bg-pink-500/10 text-pink-300',
};



const Careers = () => {
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedPopupJob, setSelectedPopupJob] = useState(null);

	const filteredJobRoles = useMemo(() => {
		if (selectedCategory === 'All') {
			return jobRoles;
		}
		return jobRoles.filter(role => role.category === selectedCategory);
	}, [selectedCategory]);


    return (
      <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <section className="border-b border-white/10 px-4 py-5">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:border-indigo-400/50 hover:text-white"
            >
            	<ArrowLeft size={16} />
            	Back to Home
            </Link>

            <Link to="/signup">
              <GradientButton className="w-full sm:w-auto">
                <span className="flex items-center justify-center gap-2">
                  Start Tracking
                  <ArrowRight size={18} />
                </span>
              </GradientButton>
            </Link>
          </div>
        </section>

				<section className="px-4 py-16 sm:py-20">
					<div className="mx-auto max-w-6xl">
						<Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          	>
							<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
              	<Briefcase size={16} />
              	WiseMindOS Careers
            	</div>
            	<h1 className="young-serif-regular text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
              	Shape the future of digital focus.
            	</h1>
            	<p className="mt-5 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
              	We are engineering a next-generation ecosystem of intelligent tools and high-performance neural pipelines. Join us to build features that empower users to live intentionally.
            	</p>
						</Motion.div>

						<div className="mt-10 grid gap-4 sm:grid-cols-3">
							{[
              	{ label: 'Open Positions', value: jobRoles.length, icon: Target },
              	{ label: 'Locations', value: 'Remote / Hybrid', icon: MapPin },
              	{ label: 'Work Week', value: '5 Days', icon: Clock },
            	].map((data, index) => {
              	const Icon = data.icon;
								return (
									<Motion.div
										key={data.label}
										whileHover={{ y: -4 }}
										transition={{ duration: 0.2, delay: index * 0.02 }}
									>
										<Card className="h-full border border-white/10 bg-white/5 backdrop-blur-lg">
											<Icon className="mb-4 text-indigo-300" size={24} />
                      <div className="text-3xl font-bold text-white">{data.value}</div>
                      <p className="mt-1 text-sm text-gray-400">{data.label}</p>
										</Card>
									</Motion.div>
								);	
							})}
						</div>
					</div>
				</section>

				<section className="px-4 pb-16">
					<div className="mx-auto max-w-6xl">
          	<div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            	<div>
              	<div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-indigo-300">
                	<Filter size={16} />
                	Filter Jobs
              	</div>
              	<h2 className="young-serif-regular text-3xl font-bold text-white">Explore Opportunities</h2>
            	</div>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<div className="flex flex-wrap gap-2" aria-label="Filter by category">
                {jobCategories.map((category) => (
                  <button
										key={category}
										type = "button"
										onClick = {() => setSelectedCategory(category)}
										className = {`rounded-xl border px-4 py-2 text-sm transition ${
											selectedCategory === category
												? 'border-indigo-400 bg-indigo-500/20 text-white'
												: 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:text-white'
										}`}
									>
										{category}
									</button>
                ))}
              </div>
						</div>

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 py-6">
							{filteredJobRoles.map((jobs, index) => {
								const Icon = jobs.icon;
								return (
									<Motion.div
										key={jobs.title}
										whileHover={{ y: -4 }}
										className="transition-all duration-300"
										transition={{ duration: 0.2, delay: index * 0.01 }}
									>
										<Card 
        							onClick={() => setSelectedPopupJob(jobs)}
        							className="flex h-full flex-col border border-white/10 bg-white/5 backdrop-blur-lg p-6 rounded-2xl cursor-pointer select-none transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10"
      							>
											<div className="mb-5 flex items-start justify-between gap-4">
												<div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300">
													<Icon size={24} />
												</div>
												<span className={`rounded-full border px-3 py-1 text-xs ${categoryStyles[jobs.category]}`}>
													{jobs.category}
												</span>
											</div>

											<h3 className="text-xl font-semibold text-white">{jobs.title}</h3>
											<p className="mt-3 flex-1 text-sm leading-6 text-gray-400">{jobs.description}</p>

											<Link to="/signup">
												<GradientButton className="w-full sm:w-auto mt-5">
													<span className="flex items-center justify-center gap-2">
														Apply Now
													</span>
												</GradientButton>
											</Link>
										</Card>
									</Motion.div>
								);
							})}
          	</div>

						{selectedPopupJob && (() => {
              const activeJob = selectedPopupJob;
              const ModalIcon = activeJob.icon;

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                    onClick={() => setSelectedPopupJob(null)} 
                  />
                  
                  <Motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gray-900/90 p-8 shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto"
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="rounded-2xl bg-indigo-500/15 p-4 text-indigo-300">
                          <ModalIcon size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white leading-tight">{activeJob.title}</h3>
                          <span className={`inline-block mt-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryStyles[activeJob.category] || 'border-white/10 text-gray-400'}`}>
                            {activeJob.category}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => setSelectedPopupJob(null)}
                        className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-sm leading-7 text-gray-300 mb-6">{activeJob.description}</p>

                    <div className="border-t border-white/10 pt-5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Core Job Requirements</h4>
                      <ul className="mt-3 list-disc list-inside space-y-2.5 text-sm text-gray-300">
                        {activeJob.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="leading-relaxed">{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedPopupJob(null)}
                        className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Close Window
                      </button>
                      
                      <Link to="/signup">
                        <GradientButton className="w-full sm:w-auto px-6 py-2.5">
                          <span className="text-white font-medium">Apply For Position</span>
                        </GradientButton>
                      </Link>
                    </div>
                  </Motion.div>
                </div>
              );
            })()}
					</div>
				</section>

				<section className="px-4 pb-20 mt-12">
					<div className="mx-auto max-w-6xl">
						<div className="mb-10 text-center">
							<h2 className="young-serif-regular text-3xl font-bold text-white">Our Culture Pillars</h2>
							<p className="mt-3 text-gray-400">How we work, build, and sustain high-performance momentum together.</p>
						</div>

						<div className="relative grid gap-4 lg:grid-cols-4">
							{cultureHighlights.map((item, index) => (
								<Motion.div
									key={item.title}
									whileHover={{ y: -4 }}
									transition={{ duration: 0.2, delay: index * 0.01 }}
								>
									<Card className="h-full border border-white/10 bg-white/5 backdrop-blur-lg p-6 rounded-2xl">
										<div className="mb-5 flex items-center justify-between gap-3">
											<span className="text-sm font-semibold text-indigo-300">Pillar {item.quarter}</span>
											<span className={`rounded-full border px-3 py-1 text-xs font-medium ${cultureStatusStyles[item.status] || 'border-white/10 text-gray-400'}`}>
												{item.status}
											</span>
										</div>
										<h3 className="text-xl font-semibold text-white">{item.title}</h3>
										<p className="mt-3 text-sm leading-6 text-gray-400">{item.summary}</p>
									</Card>
								</Motion.div>
							))}
						</div>
					</div>
      	</section>
      </main>
    );
};
export default Careers;