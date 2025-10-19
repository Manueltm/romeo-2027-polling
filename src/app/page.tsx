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
    const pool = watch('language') === 'Yoruba' ? [
      'Diẹ sii nipa Dr. Abdulrasheed',
      'Kini Dr. Abdulrasheed duro fun',
      'Bawo ni Dr. Abdulrasheed yoo ṣe dara si ipinlẹ Osun',
      'Awọn aṣeyọri Dr. Abdulrasheed',
      'Iran fun 2027',
      'Awọn eto imulo lori Eto-ọrọ',
      'Ipa agbegbe ni Osun',
      'Awọn ipilẹṣẹ Ohun-ini Gidi',
    ] : [
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
        alert(watch('language') === 'Yoruba' ? 'Aṣiṣe ni fifipamọ awọn idahun. Gbiyanju lẹẹkansi.' : 'Error saving responses. Try again.');
      }
    } catch {
      alert(watch('language') === 'Yoruba' ? 'Aṣiṣe nẹtiwọọki. Jọwọ gbiyanju lẹẹkansi.' : 'Network error. Please try again.');
    }
  };

  // Handle "Tell me more"
  const handleTellMeMore = () => {
    generateAiOptions();
    setShowModal(false);
    setStep(4);
  };

  // Handle AI question
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

  const translations = {
    title: watch('language') === 'Yoruba' ? 'Romeo 2027' : 'Romeo 2027',
    languagePrompt: watch('language') === 'Yoruba' ? 'Ede wo ni o fẹ?' : 'What language do you prefer?',
    selectLanguage: watch('language') === 'Yoruba' ? 'Yan Ede' : 'Select Language',
    next: watch('language') === 'Yoruba' ? 'Tẹsiwaju' : 'Next',
    personalInfo: watch('language') === 'Yoruba' ? 'Alaye Ti Ara Ẹni' : 'Personal Information',
    enterFullName: watch('language') === 'Yoruba' ? 'Tẹ gbogbo Orukọ rẹ' : 'Enter Full Name',
    selectState: watch('language') === 'Yoruba' ? 'Yan Ipinlẹ rẹ' : 'Select State',
    selectLga: watch('language') === 'Yoruba' ? 'Yan LGA' : 'Select LGA',
    enterWard: watch('language') === 'Yoruba' ? 'Tẹ Wardi rẹ' : 'Enter your Ward',
    selectGender: watch('language') === 'Yoruba' ? 'Ọkunrin tabi Obinrin' : 'Select Gender',
    male: watch('language') === 'Yoruba' ? 'Ọkunrin' : 'Male',
    female: watch('language') === 'Yoruba' ? 'Obinrin' : 'Female',
    previous: watch('language') === 'Yoruba' ? 'Pada sehin' : 'Previous',
    continue: watch('language') === 'Yoruba' ? 'Tẹsiwaju' : 'Continue to Next Section',
    doYouKnow: watch('language') === 'Yoruba' ? 'Ṣe o mọ...' : 'Do you know...',
    residencePlaceholder: watch('language') === 'Yoruba' ? 'Tẹ adirẹsi ibugbe' : 'Enter residential address',
    phonePlaceholder: watch('language') === 'Yoruba' ? 'Tẹ nọmba foonu' : 'Enter phone number (optional)',
    submit: watch('language') === 'Yoruba' ? 'Fi silẹ' : 'Submit',
    languageRequired: watch('language') === 'Yoruba' ? 'Ede se pataki' : 'Language is required',
    nameRequired: watch('language') === 'Yoruba' ? 'Orukọ se pataki' : 'Full name is required',
    stateRequired: watch('language') === 'Yoruba' ? 'Ipinlẹ se pataki' : 'State is required',
    lgaRequired: watch('language') === 'Yoruba' ? 'LGA se pataki' : 'LGA is required',
    wardRequired: watch('language') === 'Yoruba' ? 'Ward se pataki' : 'Ward is required',
    ageRequired: watch('language') === 'Yoruba' ? 'Ọjọ ori se pataki' : 'Age is required',
    genderRequired: watch('language') === 'Yoruba' ? 'Idena se pataki' : 'Gender is required',
    residenceRequired: watch('language') === 'Yoruba' ? 'Adirẹsi ibugbe se pataki' : 'Residential address is required',
    phoneInvalid: watch('language') === 'Yoruba' ? 'Tẹ nọmba foonu to wulo' : 'Enter a valid phone number',
    yes: watch('language') === 'Yoruba' ? 'Bẹẹni' : 'Yes',
    no: watch('language') === 'Yoruba' ? 'Rara' : 'No',
    romeoLabel: watch('language') === 'Yoruba' ? 'Romeo' : 'Romeo',
    muyideenLabel: watch('language') === 'Yoruba' ? 'Dr. Muyideen' : 'Dr. Muyideen',
    abdulrasheedLabel: watch('language') === 'Yoruba' ? 'Dr. Abdulrasheed' : 'Dr. Abdulrasheed',
    savewellLabel: watch('language') === 'Yoruba' ? 'Savewell Homes' : 'Savewell Homes',
    responseRequired: (label: string) => watch('language') === 'Yoruba' ? `Idahun ${label} nilo` : `${label} response is required`,
    progressLabels: watch('language') === 'Yoruba' ? ['Ede', 'Alaye Ti Ara Ẹni', 'Awọn Ibeere Imọ'] : ['Language', 'Personal Info', 'Knowledge Questions'],
    modal: {
      name: watch('language') === 'Yoruba' ? 'Dr. Abdulrasheed Nuideen Romeo' : 'Dr. Abdulrasheed Nuideen Romeo',
      age: watch('language') === 'Yoruba' ? 'Ọjọ ori: 48 ọdun' : 'Age: 48 years',
      party: watch('language') === 'Yoruba' ? 'Ẹgbẹ: APC' : 'Party: APC',
      identity: watch('language') === 'Yoruba' ? 'Idanimọ: Oloselu, Real Estate & Oludamọran' : 'Identity: Politician, Real Estate & Mentor',
      tellMeMore: watch('language') === 'Yoruba' ? 'Sọ diẹ sii fun mi' : 'Tell me more',
      close: watch('language') === 'Yoruba' ? 'Mo kọ' : 'Close',
    },
    aiSection: {
      title: watch('language') === 'Yoruba' ? 'Kọ ẹkọ diẹ sii nipa Dr. Abdulrasheed' : 'Learn More About Dr. Abdulrasheed',
      askPlaceholder: watch('language') === 'Yoruba' ? 'Beere Ohunkohun Lọwọ Dr. Abdulrasheed' : 'Ask Dr. Abdulrasheed Anything',
      ask: watch('language') === 'Yoruba' ? 'Beere' : 'Ask',
      saveAndQuit: watch('language') === 'Yoruba' ? 'Fipamọ ki o jade' : 'Save and Quit',
      loading: watch('language') === 'Yoruba' ? 'Dr. Abdulrasheed n dahun...' : 'Dr. Abdulrasheed is answering...',
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">{translations.title}</h1>

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
                <h2 className="text-2xl font-semibold mb-4">{translations.languagePrompt}</h2>
                <Controller
                  name="language"
                  control={control}
                  rules={{ required: translations.languageRequired }}
                  render={({ field }) => (
                    <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">{translations.selectLanguage}</option>
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
                  {translations.next}
                </button>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <h2 className="text-2xl font-semibold mb-4">{translations.personalInfo}</h2>
              <div className="space-y-4">
                <div>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: translations.nameRequired }}
                    render={({ field }) => (
                      <input {...field} placeholder={translations.enterFullName} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: translations.stateRequired }}
                    render={({ field }) => (
                      <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">{translations.selectState}</option>
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
                    rules={{ required: translations.lgaRequired }}
                    render={({ field }) => (
                      <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!selectedState}>
                        <option value="">{translations.selectLga}</option>
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
                    rules={{ required: translations.wardRequired }}
                    render={({ field }) => (
                      <input {...field} placeholder={translations.enterWard} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  />
                  {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward.message}</p>}
                </div>

                <div>
                  <Controller
                    name="age"
                    control={control}
                    rules={{ required: translations.ageRequired }}
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
                    rules={{ required: translations.genderRequired }}
                    render={({ field }) => (
                      <select {...field} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">{translations.selectGender}</option>
                        <option value="male">{translations.male}</option>
                        <option value="female">{translations.female}</option>
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
                    {translations.previous}
                  </button>
                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slideNext()}
                    disabled={!isPersonalInfoStepValid}
                    className="mt-6 bg-blue-500 text-white p-3 rounded flex-1 disabled:bg-gray-400"
                  >
                    {translations.continue}
                  </button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <h2 className="text-2xl font-semibold mb-4">{translations.doYouKnow}</h2>
              <div className="space-y-4">
                {[
                  { name: 'knowsRomeo', label: translations.romeoLabel },
                  { name: 'knowsMuyideen', label: translations.muyideenLabel },
                  { name: 'knowsAbdulrasheed', label: translations.abdulrasheedLabel },
                  { name: 'heardSavewell', label: translations.savewellLabel },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <Controller
                      name={name as keyof FormData}
                      control={control}
                      rules={{ required: translations.responseRequired(label) }}
                      render={({ field }) => (
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={field.value === 'Yes'}
                              onChange={() => field.onChange('Yes')}
                              className="mr-2"
                            />
                            {translations.yes}
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={field.value === 'No'}
                              onChange={() => field.onChange('No')}
                              className="mr-2"
                            />
                            {translations.no}
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
                    rules={{ required: translations.residenceRequired }}
                    render={({ field }) => (
                      <input {...field} placeholder={translations.residencePlaceholder} className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  />
                  {errors.residence && <p className="text-red-500 text-sm mt-1">{errors.residence.message}</p>}
                </div>

                <div>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ pattern: { value: /^\d{10,11}$/, message: translations.phoneInvalid } }}
                    render={({ field }) => (
                      <input {...field} placeholder={translations.phonePlaceholder} type="tel" className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                    {translations.previous}
                  </button>
                  <button
                    type="submit"
                    disabled={!isKnowledgeStepValid}
                    className="mt-6 bg-green-500 text-white p-3 rounded flex-1 disabled:bg-gray-400"
                  >
                    {translations.submit}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Progress Bar */}
          <div className="mt-6 flex justify-between items-center">
            {translations.progressLabels.map((label, index) => (
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
                <h3 className="text-xl font-bold">{translations.modal.name}</h3>
                <p className="text-gray-600">{translations.modal.age}</p>
                <p className="text-gray-600">{translations.modal.party}</p>
                <p className="text-gray-600">{translations.modal.identity}</p>
              </div>
              <div className="flex mt-4">
                <button onClick={handleTellMeMore} className="bg-blue-500 text-white p-3 rounded mr-2">
                  {translations.modal.tellMeMore}
                </button>
                <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white p-3 rounded">
                  {translations.modal.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Section */}
      {step === 4 && (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col items-center">
            <Image src="/politician-image.jpg" alt="Dr. Abdulrasheed" width={150} height={150} className="rounded-lg mb-4" />
            <h2 className="text-2xl font-semibold mb-4 text-center">{translations.aiSection.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
              {aiOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAiSubmit(opt)}
                  className="text-left bg-gray-200 p-3 rounded hover:bg-gray-300"
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="w-full">
              <input
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={translations.aiSection.askPlaceholder}
                className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAiSubmit(aiQuestion)}
                className="mt-4 bg-blue-500 text-white p-3 rounded w-full disabled:bg-gray-400"
                disabled={!aiQuestion.trim()}
              >
                {translations.aiSection.ask}
              </button>
              <button
                onClick={handleSaveAndQuit}
                className="mt-4 bg-red-500 text-white p-3 rounded w-full"
              >
                {translations.aiSection.saveAndQuit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Loading Modal */}
      {showAiLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <p className="text-gray-800 text-center">{translations.aiSection.loading}</p>
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
              {translations.modal.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}