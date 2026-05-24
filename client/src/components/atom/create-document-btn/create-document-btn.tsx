import './create-document-btn.css';
import { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import DocumentService from '../../../service/document-service';
import { useNavigate } from 'react-router-dom';
import Spinner from '../spinner/spinner';

const CreateDocumentBtn = () => {
    const [loading, setLoading] = useState(false);
    const { accessToken } = useAuth();
    const navigate = useNavigate();
    const localAT = localStorage.getItem('Token')

    const handleCreateDocument = async () => {
        // if (accessToken == null) return;
        if (localAT == null) return;

        try {
            setLoading(true);
            // const response = await DocumentService.create(accessToken);
            const response = await DocumentService.create(localAT);
            const { id } = response.data; // define interface of document 

            navigate(`/document/${id}`)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='create-document-container'>
            <div className="create-document-wrapper">
                <h3>Start a new document</h3>
                <div className='create-document-card-container'>
                    <div className='create-document-card'>
                        <div className='create-document-button' onClick={handleCreateDocument}>
                            <img src='https://ssl.gstatic.com/docs/templates/thumbnails/docs-blank-googlecolors.png' />
                            {loading && <Spinner/>}
                        </div>
                        <h4>Blank</h4>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateDocumentBtn;