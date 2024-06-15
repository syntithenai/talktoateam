import  { useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker'


export default function GoogleDriverPickerButton({exportDocument}) {
  const [openPicker, authResponse] = useDrivePicker();  
  // const customViewsArray = [new google.picker.DocsView()]; // custom view
  
  //console.log("PICKER", import.meta.env.VITE_GOOGLE_PICKER_CLIENT_ID, import.meta.env.VITE_GOOGLE_PICKER_API_KEY)
  
  const handleOpenPicker = () => {
    openPicker({
      clientId: import.meta.env.VITE_GOOGLE_PICKER_CLIENT_ID,
      developerKey: import.meta.env.VITE_GOOGLE_PICKER_API_KEY,
      viewId: "DOCS",
      // token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }
        console.log(data)
        if (data && data.action === 'picked' && data.docs && data.docs[0] && data.docs[0].id) {
			console.log("EXPORT",data.docs[0].id)
			exportDocument(data.docs[0].id).then(function(docData) {
				console.log("DL", docData)
			})
			
		}
      },
    })
  }


  
  return (
    <div>
        <button onClick={() => handleOpenPicker()}>Open Picker</button>
    </div>
  );
}

