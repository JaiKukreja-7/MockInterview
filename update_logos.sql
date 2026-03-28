-- ============================================================
-- UPDATE COMPANY LOGOS IN company_questions
-- Run this in the Supabase SQL Editor
-- ============================================================

UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=google.com&sz=64' WHERE LOWER(company) = 'google';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=meta.com&sz=64' WHERE LOWER(company) = 'meta';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=64' WHERE LOWER(company) = 'microsoft';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=amazon.com&sz=64' WHERE LOWER(company) = 'amazon';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=adobe.com&sz=64' WHERE LOWER(company) = 'adobe';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=flipkart.com&sz=64' WHERE LOWER(company) = 'flipkart';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=paytm.com&sz=64' WHERE LOWER(company) = 'paytm';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=zomato.com&sz=64' WHERE LOWER(company) = 'zomato';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=swiggy.in&sz=64' WHERE LOWER(company) = 'swiggy';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=cred.club&sz=64' WHERE LOWER(company) = 'cred';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=razorpay.com&sz=64' WHERE LOWER(company) = 'razorpay';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=infosys.com&sz=64' WHERE LOWER(company) = 'infosys';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=tcs.com&sz=64' WHERE LOWER(company) = 'tcs';
UPDATE company_questions SET company_logo_url = 'https://www.google.com/s2/favicons?domain=wipro.com&sz=64' WHERE LOWER(company) = 'wipro';
