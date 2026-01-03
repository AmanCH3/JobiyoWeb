export const getPasswordResetTemplate = (otp, resetUrl) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px;
            text-align: center;
        }
        .otp-box {
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #4f46e5;
        }
        .btn {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 10px;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #4338ca;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Jobiyo</h1>
        </div>
        <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #64748b;">We received a request to reset your password. Use the code below to complete the process.</p>
            
            <div class="otp-box">
                ${otp}
            </div>

            <p style="margin-bottom: 24px; color: #64748b;">Or click the button below to verify automatically:</p>
            
            <a href="${resetUrl}" class="btn" style="color: white !important;">Verify Account</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #94a3b8;">
                This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
            </p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Jobiyo. All rights reserved.</p>
            <p>123 Job Portal St, Tech City</p>
        </div>
    </div>
</body>
</html>
    `;
};
