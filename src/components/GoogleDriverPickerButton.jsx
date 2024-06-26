import  { useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker'
import {Button} from 'react-bootstrap'
import useUtils from '../useUtils'
export default function GoogleDriverPickerButton({exportDocument, onSelect, icons}) {
  const [openPicker, authResponse] = useDrivePicker();  
  // const customViewsArray = [new google.picker.DocsView()]; // custom view
  const utils = useUtils()
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
        let promises = []
        if (data && data.action === 'picked' && Array.isArray(data.docs)) {
          data.docs.forEach(function(d) {
            promises.push(exportDocument(d.id))
          })

        } 
        Promise.all(promises).then(function(res) {
          let final = []
          for (let i = 0; i < res.length; i++) {
            final.push({id: utils.generateRandomId(), googleId: data && data.docs && data.docs[i] && data.docs[i].id ? data.docs[i].id : '',  name: data && data.docs && data.docs[i] && data.docs[i].name ? data.docs[i].name : '', data: res[i]})
          }
          onSelect(final)
        })
			
		  }
    })
  }


  
  return <Button variant="outline-success" size="sm"  onClick={function() {handleOpenPicker()}} >{icons.googledrive}</Button>
}

