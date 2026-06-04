UPDATE u
SET
    SenderName = CASE
        WHEN u.CreatedByUserId IS NOT NULL THEN N'Admin'
        ELSE N'Khach hang'
    END,
    IsAdminReply = CASE
        WHEN u.CreatedByUserId IS NOT NULL AND u.IsInternalNote = 0 THEN 1
        ELSE 0
    END
FROM SupportTicketUpdates u
WHERE (u.SenderName IS NULL OR LTRIM(RTRIM(u.SenderName)) = '');

