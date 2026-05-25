import { validationResult } from "express-validator";
import db from "../../db/modle/index.js";
import mailService from "../../service/mail-service.js";
import dotenv from 'dotenv';
dotenv.config();

class ShareDocumentController {
    create = async (req, res) => {
        const err = validationResult(req);
        if (!(err.isEmpty())) return res.status(400).json(err);

        const { id } = req.params;
        const { email, permission } = req.body;

        const isShared = await db.DocumentUser.findOne({
            where: {
                documentId: id,
                email: email
            }
        });
        if (isShared) {
            const msg = {
                msg: "Allready shared"
            };
            return res.status(400).json({ errors: [msg] });
        }

        const document = await db.Document.findByPk(id);
        if (document.userId !== parseInt(req.user.id)) {
            return res.status(400);
        }

        const sharedUser = await db.User.findOne({
            where: {
                email,
            },
        });
        if (!sharedUser) return res.sendStatus(400);

        const documentUser = await db.DocumentUser.create({
            documentId: id,
            userId: sharedUser.id,
            permission: permission,
            email: email,
        });

        // mail service must
        const mailOptions = {
            from: 'featherDocs@gmail.com',
            to: sharedUser.email,
            subject: `${req.user.email} shared a document with you!`,
            text: `Click the following links to view and edit the document: ${process.env.FRONT_END_URL}/document/${id}`,
        };

        try {
            await mailService.sendEmail(mailOptions);
        } catch (mailError) {
            console.error("Failed to send sharing notification email:", mailError.message || mailError);
            // We intentionally catch this error so that mail delivery issues (e.g., SMTP configurations, TLS mismatch)
            // do not crash the Node server or fail the HTTP response when the DB share mapping succeeded.
        }

        return res.status(200).json(documentUser);
    }
}

const shareController = new ShareDocumentController();
export default shareController;