'use client';

import { useState, useRef } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper/types';
import 'swiper/css';
import Image from 'next/image';
import nigeriaData from '@/data/nigeria.json';

type FormData = {
  language: 'English' | 'Yoruba';
  name: string;
  state: string;
  lga: string;
  ward: string;
  age: string;
  gender: 'male' | 'female';
  knowsRomeo: 'Yes' | 'No';
  knowsMuyideen: 'Yes' | 'No';
  knowsAbdulrasheed: 'Yes' | 'No';
  heardSavewell: 'Yes' | 'No';
  residence: string;
  phone: string;
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showAiResponseModal, setShowAiResponseModal] = useState(false);
  const [showAiLoadingModal, setShowAiLoadingModal] = useState(false);
  const [aiOptions, setAiOptions] = useState<string[]>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const swiperRef = useRef<SwiperClass | null>(null);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      language: 'English',
      name: '',
      state: '',
      lga: '',
      ward: '',
      age: '',
      gender: undefined as 'male' | 'female' | undefined,
      knowsRomeo: undefined as 'Yes' | 'No' | undefined,
      knowsMuyideen: undefined as 'Yes' | 'No' | undefined,
      knowsAbdulrasheed: undefined as 'Yes' | 'No' | undefined,
      heardSavewell: undefined as 'Yes' | 'No' | undefined,
      residence: '',
      phone: '',
    },
    mode: 'onChange',
  });

  const selectedState = watch('state');
  const lgas = nigeriaData.states.find(s => s.name === selectedState)?.lgas || [];

  // Validate specific fields for each step
  const isLanguageStepValid = !!watch('language');
  const isPersonalInfoStepValid =
    !!watch('name') &&
    !!watch('state') &&
    !!watch('lga') &&
    !!watch('ward') &&
    !!watch('age') &&
    !!watch('gender');
  const isKnowledgeStepValid =
    ['knowsRomeo', 'knowsMuyideen', 'knowsAbdulrasheed', 'heardSavewell'].every(
      (k) => watch(k as keyof FormData) === 'Yes' || watch(k as keyof FormData) === 'No'
    ) && !!watch('residence');

  // Generate 4 random AI options
  const generateAiOptions = () => {
    const pool = [
      'More about Dr. Abdulrasheed',
      'What Dr. Abdulrasheed Stands for',
      'How will Dr. Abdulrasheed better Osun state',
      'Dr. Abdulrasheed’s Achievements',
      'Vision for 2027',
      'Policies on Economy',
      'Community Impact in Osun',
      'Real Estate Initiatives',
    ];
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    setAiOptions(shuffled);
  };

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await fetch('/api/save-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setStep(3);
        setShowModal(true);
      } else {
        alert('Error saving responses. Try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
  };

  // Handle "Tell me more"
  const handleTellMeMore = () => {
    generateAiOptions();
    setShowModal(false);
    setStep(4);
  };

  // Handle AI question (for both suggested questions and custom input)
  const handleAiSubmit = async (question: string) => {
    if (!question.trim()) return;
    setShowAiLoadingModal(true);
    try {
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const { response: aiText } = await response.json();
      setAiResponse(aiText);
      setShowAiLoadingModal(false);
      setShowAiResponseModal(true);
    } catch {
      setAiResponse('Error fetching response. Please try again.');
      setShowAiLoadingModal(false);
      setShowAiResponseModal(true);
    }
  };

  // Handle Save and Quit
  const handleSaveAndQuit = () => {
    window.location.reload();
  };

  // Yoruba stub
  if (watch('language') === 'Yoruba') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-500">Yoruba version coming soon. Please select English.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">Romeo 2027</h1>

      {step < 3 && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            allowTouchMove={false}
            onSlideChange={(s) => setStep(s.activeIndex)}
            onSwiper={(s) => (swiperRef.current = s)}
          >
            <SwiperSlide>
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">What language do you prefer?</h2>
                <Controller
                  name="language"
                  control={control}
                  rules={{ required: 'Language is required' }}
                  render={({ field }) => (
                    <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Yoruba">Yoruba</option>
                    </select>
                  )}
                />
                {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  disabled={!isLanguageStepValid}
                  className="mt-6 bg-blue-500 text-white p-3 rounded w-full disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Full name is required' }}
                    render={({ field }) => (
                      <input {...field} placeholder="Enter Full Name" className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: 'State is required' }}
                    render={({ field }) => (
                      <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select State</option>
                        {nigeriaData.states.map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <Controller
                    name="lga"
                    control={control}
                    rules={{ required: 'LGA is required' }}
                    render={({ field }) => (
                      <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!selectedState}>
                        <option value="">Select LGA</option>
                        {lgas.map(lga => (
                          <option key={lga} value={lga}>{lga}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.lga && <p className="text-red-500 text-sm mt-1">{errors.lga.message}</p>}
                </div>

                <div>
                  <Controller
                    name="ward"
                    control={control}
                    rules={{ required: 'Ward is required' }}
                    render={({ field }) => (
                      <input {...field} placeholder="Enter your Ward" className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  />
                  {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward.message}</p>}
                </div>

                <div>
                  <Controller
                    name="age"
                    control={control}
                    rules={{ required: 'Age is required' }}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {['<18 years', '18 - 24 years', '25 - 34 years', '35 - 49 years', '50+ years'].map(opt => (
                          <label key={opt} className="flex items-center">
                            <input {...field} type="radio" value={opt} className="mr-2" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
                </div>

                <div>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: 'Gender is required' }}
                    render={({ field }) => (
                      <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    )}
                  />
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="mt-6 bg-gray-500 text-white p-3 rounded flex-1"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slideNext()}
                    disabled={!isPersonalInfoStepValid}
                    className="mt-6 bg-blue-500 text-white p-3 rounded flex-1 disabled:bg-gray-400"
                  >
                    Continue to Next Section
                  </button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <h2 className="text-2xl font-semibold mb-4">Do you know...</h2>
              <div className="space-y-4">
                {[
                  { name: 'knowsRomeo', label: 'Romeo' },
                  { name: 'knowsMuyideen', label: 'Dr. Muyideen' },
                  { name: 'knowsAbdulrasheed', label: 'Dr. Abdulrasheed' },
                  { name: 'heardSavewell', label: 'Savewell Homes' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <Controller
                      name={name as keyof FormData}
                      control={control}
                      rules={{ required: `${label} response is required` }}
                      render={({ field }) => (
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={field.value === 'Yes'}
                              onChange={() => field.onChange('Yes')}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={field.value === 'No'}
                              onChange={() => field.onChange('No')}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      )}
                    />
                    {errors[name as keyof FormData] && (
                      <p className="text-red-500 text-sm mt-1">{errors[name as keyof FormData]?.message}</p>
                    )}
                  </div>
                ))}

                <div>
                  <Controller
                    name="residence"
                    control={control}
                    rules={{ required: 'Residential address is required' }}
                    render={({ field }) => (
                      <input {...field} placeholder="Enter residential address" className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  />
                  {errors.residence && <p className="text-red-500 text-sm mt-1">{errors.residence.message}</p>}
                </div>

                <div>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ pattern: { value: /^\d{10,11}$/, message: 'Enter a valid phone number' } }}
                    render={({ field }) => (
                      <input {...field} placeholder="Enter phone number (optional)" type="tel" className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="mt-6 bg-gray-500 text-white p-3 rounded flex-1"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={!isKnowledgeStepValid}
                    className="mt-6 bg-green-500 text-white p-3 rounded flex-1 disabled:bg-gray-400"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Progress Bar */}
          <div className="mt-6 flex justify-between items-center">
            {['Language', 'Personal Info', 'Knowledge Questions'].map((label, index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className={`h-2 rounded ${index <= step ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
                <p className={`text-sm mt-2 ${index <= step ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* Submission Popup Card */}
      {showModal && step === 3 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg flex max-w-lg w-full">
            <Image src="/politician-image.jpg" alt="Dr. Abdulrasheed" width={200} height={200} className="rounded-lg mr-6" />
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold">Dr. Abdulrasheed Nuideen Romeo</h3>
                <p className="text-gray-600">Age: 48 years</p>
                <p className="text-gray-600">Party: APC</p>
                <p className="text-gray-600">Identity: Politician, Real Estate & Mentor</p>
              </div>
              <div className="flex mt-4">
                <button onClick={handleTellMeMore} className="bg-blue-500 text-white p-3 rounded mr-2">
                  Tell me more
                </button>
                <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white p-3 rounded">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Section */}
      {step === 4 && (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row">
            <Image src="/politician-image.jpg" alt="Dr. Abdulrasheed" width={200} height={200} className="rounded-lg mb-4 sm:mb-0 sm:mr-6" />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-4">Learn More About Dr. Abdulrasheed</h2>
              {aiOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAiQuestion(opt);
                    handleAiSubmit(opt);
                  }}
                  className="block w-full text-left bg-gray-200 p-3 rounded mb-2 hover:bg-gray-300"
                >
                  {opt}
                </button>
              ))}
              <input
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask Dr. Abdulrasheed Anything"
                className="p-3 border rounded w-full mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAiSubmit(aiQuestion)}
                className="mt-4 bg-blue-500 text-white p-3 rounded w-full disabled:bg-gray-400"
                disabled={!aiQuestion.trim()}
              >
                Ask
              </button>
              <button
                onClick={handleSaveAndQuit}
                className="mt-6 bg-red-500 text-white p-3 rounded w-full"
              >
                Save and Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Loading Modal */}
      {showAiLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <p className="text-gray-800 text-center">Dr. Abdulrasheed is answering...</p>
          </div>
        </div>
      )}

      {/* AI Response Popup */}
      {showAiResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <Image src="/politician-image.jpg" alt="Dr. Abdulrasheed" width={200} height={200} className="rounded-lg mx-auto mb-4" />
            <p className="text-gray-800 mb-4">{aiResponse}</p>
            <button
              onClick={() => setShowAiResponseModal(false)}
              className="bg-gray-500 text-white p-3 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}