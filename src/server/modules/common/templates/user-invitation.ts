import { CustomEmailTemplateType } from '.';
import { User } from '../../user/user.model';

const appName = 'Sales Tracker';
export const UserInvitationTemplate: CustomEmailTemplateType = {
  subject: () => `Invitation to ${appName}`,
  text: (_user: User | null, url: string) => {
    return `To reset your password and complete your setup,
        please click on this link: ${url}`;
  },
  html: (_user: User | null, url: string) => {
    return `<div style="margin:0;padding:0;background:#f5f7fb">
    <table
      width="100%"
      height="100%"
      style="min-width:348px"
      border="0"
      cellspacing="0"
      cellpadding="0"
      lang="en"
    >
      <tbody>
        <tr height="16" style="height:16px">
          <td></td>
        </tr>
        <tr align="center">
          <td>
            <div>
              <div></div>
            </div>
            <table
              border="0"
              cellspacing="0"
              cellpadding="0"
              style="padding-bottom:20px;max-width:516px;min-width:220px"
            >
              <tbody>
                <tr>
                  <td width="8" style="width:8px"></td>
                  <td style="width: 100%;">
                    <div
                      style="border-style:solid;border-width:thin;border-color:#dadce0;padding:40px 20px;background: white;border-radius: 3px"
                      align="center"
                    >
                      <div
                        style="width: 25px;
                                            border: thin;
                                            border-color: grey;
                                            background: #ecf2fd;
                                            border-radius: 50%;
                                            padding: 25px;
                                            height: 25px;"
                      >
                        <img
                          style="display: inline-block;
                          font-size: 2em;
                          height: 1em;
                          overflow: visible;
                          vertical-align: -0.125em;
                          width: 1em;
                          top: -3px;
                          position: relative;
                          right: 4px;
                          color: #467fcf;"
                          src="https://d3s2030oirvd6v.cloudfront.net/ops-master-assets/sparkles-light-blue.png"
                        />
                      </div>
                      <div
                        style="font-family:'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;color: #454c52 !important;line-height:32px;padding-top: 20px;text-align:center;word-break:break-word"
                      >
                        <div style="font-size:24px;font-weight: 200;">
                          Your account has been created
                        </div>
                      </div>
                      <div
                        style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:14px;color: #454c52 !important;line-height:20px;padding-top:20px;text-align:center"
                      >
                        <p>
                          You have been invited to the ${appName}.<br />
                          Click on the button below to set your password and to
                          complete your account setup:
                        </p>
                        <div style="padding-top:32px;text-align:center">
                          <a
                            href="${url}"
                            style="font-family:'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;line-height:16px;color:#ffffff;font-weight:400;text-decoration:none;font-size:14px;display:inline-block;padding:10px 24px;background-color:#467fcf;border-radius:3px;min-width:90px"
                            target="_blank"
                          >
                            Complete setup</a
                          >
                        </div>
                      </div>
                      <div style="text-align:left">
                        <div
                          style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:50px;text-align:center"
                        >
                          <div>You can also click here:</div>
                          <a href="${url}">${url}</a>
                          <div style="direction:ltr">
                            <a
                              style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center"
                            >
                              You can ignore this email if you didn't request for
                              your password to be reset.</a
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td width="8" style="width:8px"></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr height="32" style="height:32px">
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
  `;
  },
};
