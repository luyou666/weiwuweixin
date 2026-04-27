-- Reset test account passwords
UPDATE "Account" SET "passwordHash" = '$2b$12$gs7hrBZOTzn1sWwuQJjr8OZxefRf9HGVf6seao8MgqGqqIPTh3vDS' WHERE email = 'test@example.com';

-- Create luheer test account
INSERT INTO "User" (id, handle, nickname, email, "createdAt", "updatedAt") 
VALUES ('luheer-test-user-00000001', 'luheer', '鹿赫儿', 'luheer@test.com', NOW(), NOW()) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Account" (id, email, "passwordHash", "userId", "createdAt", "updatedAt") 
VALUES ('luheer-acct-00000001', 'luheer@test.com', '$2b$12$gs7hrBZOTzn1sWwuQJjr8OZxefRf9HGVf6seao8MgqGqqIPTh3vDS', 'luheer-test-user-00000001', NOW(), NOW()) 
ON CONFLICT (email) DO UPDATE SET "passwordHash" = '$2b$12$gs7hrBZOTzn1sWwuQJjr8OZxefRf9HGVf6seao8MgqGqqIPTh3vDS';