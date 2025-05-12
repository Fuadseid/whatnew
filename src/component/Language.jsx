import React, { useEffect, useState } from "react";
import { FiGlobe, FiCheck, FiChevronDown, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const Language = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation("Language");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState({
    code: "en",
    name: "English",
    native: "English",
    flag: "🇬🇧",
  });

  const languages = [
    { code: "am", name: "Amharic", native: "አማርኛ", flag: "ET" },
    { code: "en", name: "English", native: "English", flag: "🇬🇧" },
    { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
    { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
    { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
    { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
    { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  ];

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    document.body.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);

  const handleLanguageSelect = (language) => {
    i18n.changeLanguage(language.code);
    localStorage.setItem("selectedLanguage", JSON.stringify(language)); 
    setSelectedLanguage(language);
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      const parseLanguage = JSON.parse(savedLanguage);
      setSelectedLanguage(parseLanguage);
      i18n.changeLanguage(parseLanguage.code);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br w-full from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiGlobe className="w-6 h-6" />
                <h1 className="text-2xl font-bold">{t('title')}</h1>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {t('languageCount', { count: languages.length })}
              </div>
            </div>
            <p className="mt-2 opacity-90">{t('subtitle')}</p>
          </div>

          {/* Current Selection */}
          <div
            className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedLanguage.flag}</span>
              <div>
                <p className="font-medium">{selectedLanguage.name}</p>
                <p className="text-sm text-gray-500">{selectedLanguage.native}</p>
              </div>
            </div>
            <div>
              <FiChevronDown className="text-gray-400" />
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="overflow-hidden">
              {/* Search */}
              <div className="p-3 sticky top-0 bg-white border-b border-gray-100">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Language List */}
              <div className="divide-y divide-gray-100">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <div
                      key={language.code}
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors ${
                        language.code === i18n.language ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleLanguageSelect(language)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <p className="font-medium">{language.name}</p>
                          <p className="text-sm text-gray-500">{language.native}</p>
                        </div>
                      </div>
                      {language.code === i18n.language && (
                        <div>
                          <FiCheck className="text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {t('noResults', { searchTerm })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {t('didYouKnow')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('translationCoverage', { count: languages.length })}
          </p>
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <FiGlobe />
            <span>{t('helpTranslate')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Language;
