import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Ensure we have a valid locale, fallback to 'zh' if undefined
  const targetLocale = locale || 'zh';
  
  return {
    locale: targetLocale,
    messages: (await import(`../../messages/${targetLocale}.json`)).default
  };
});
