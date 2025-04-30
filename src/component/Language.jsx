import React, { useEffect, useState } from "react";
import { FiGlobe, FiCheck, FiChevronDown, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const dropdownVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.4
      }
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        type: "spring",
        bounce: 0,
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br w-full from-blue-50 to-indigo-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full max-w-md"
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl overflow-hidden"
          layout // This will animate layout changes
        >
          {/* Header */}
          <motion.div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                >
                  <FiGlobe className="w-6 h-6" />
                </motion.div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
              </div>
              <motion.div
                className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('languageCount', { count: languages.length })}
              </motion.div>
            </div>
            <motion.p 
              className="mt-2 opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.2 }}
            >
              {t('subtitle')}
            </motion.p>
          </motion.div>

          {/* Current Selection */}
          <motion.div
            className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <motion.span 
                className="text-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                key={selectedLanguage.code}
              >
                {selectedLanguage.flag}
              </motion.span>
              <div>
                <p className="font-medium">{selectedLanguage.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedLanguage.native}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring" }}
            >
              <FiChevronDown className="text-gray-400" />
            </motion.div>
          </motion.div>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="overflow-hidden"
                initial="closed"
                animate="open"
                exit="closed"
                variants={dropdownVariants}
              >
                {/* Search */}
                <motion.div 
                  className="p-3 sticky top-0 bg-white border-b border-gray-100"
                  variants={itemVariants}
                >
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
                </motion.div>

                {/* Language List */}
                <motion.div 
                  className="divide-y divide-gray-100"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => (
                      <motion.div
                        key={language.code}
                        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors ${
                          language.code === i18n.language
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() => handleLanguageSelect(language)}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{language.flag}</span>
                          <div>
                            <p className="font-medium">{language.name}</p>
                            <p className="text-sm text-gray-500">
                              {language.native}
                            </p>
                          </div>
                        </div>
                        {language.code === i18n.language && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <FiCheck className="text-blue-600" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      className="p-4 text-center text-gray-500"
                      variants={itemVariants}
                    >
                      {t('noResults', { searchTerm })}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-6 bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {t('didYouKnow')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('translationCoverage', { count: languages.length })}
          </p>
          <motion.div 
            className="flex items-center space-x-2 text-sm text-blue-600"
            whileHover={{ x: 5 }}
          >
            <FiGlobe />
            <span>{t('helpTranslate')}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Language;