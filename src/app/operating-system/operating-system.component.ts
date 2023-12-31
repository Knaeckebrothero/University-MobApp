import { Component, OnInit } from '@angular/core';

// Declare a custom window interface
declare let window: CustomWindow;
interface CustomWindow extends Window {
  chooseFileSystemEntries: (options: any) => Promise<any>;
}

@Component({
  selector: 'app-operating-system',
  templateUrl: './operating-system.component.html',
  styleUrls: ['./operating-system.component.scss']
})
export class OperatingSystemComponent implements OnInit {
  
  // Variable declaration
  usage: number | string = 'unknown';
  quota: number | string = 'unknown';
  percent: number | string = 'unknown';
  persisted: string = 'unknown';
  selectedFileCount: number = 0;
  fileInfos: Array<{ name: string; type: string; size: number; lastModified: string }> = [];
  selectedEngine: 'localStorage' | 'sessionStorage' = 'localStorage';
  myKeyValue: string = '';
  storageLog: string[] = [];

  constructor() {}

  // On Init mehtod to inizialize and display the different values
  ngOnInit() {
    // Use the StorageManager API to check if the storage is persisted and the usage and quota
    this.checkStorageEstimate();
    this.checkPersisted();

    // Use the selected storage engine to read the value or set it to an empty string if it doesn't exist
    this.myKeyValue = window[this.selectedEngine].getItem('myKey') || '';

    // Add a listener to the storage event to react to changes in other tabs/windows and update the value
    window.addEventListener('storage', this.onStorageChanged.bind(this));
  }

  // Method to select the storage engine via a radio button in the html
  selectEngine(engine: 'localStorage' | 'sessionStorage') {
    this.selectedEngine = engine;
    this.myKeyValue = window[this.selectedEngine].getItem('myKey') || '';
  }

  // Method to update the value of the selected storage engine via a text input in the html
  updateKeyValue(value: string) {
    window[this.selectedEngine].setItem('myKey', value);
    this.myKeyValue = value;
  }

  // 
  onStorageChanged(event: StorageEvent) {
    const timeBadge = new Date().toTimeString().split(' ')[0];
    const changeMessage = `${timeBadge} External change in ${event.storageArea === window.localStorage ? 'localStorage' : 'sessionStorage'}: key ${event.key} changed from ${event.oldValue} to ${event.newValue}.`;
    this.storageLog.push(changeMessage);

    if ((event.storageArea === window.localStorage && this.selectedEngine === 'localStorage') ||
        (event.storageArea === window.sessionStorage && this.selectedEngine === 'sessionStorage')) {
      this.myKeyValue = window[this.selectedEngine].getItem('myKey') || '';
    }
  }

  readFiles(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      const files = inputElement.files;
      this.selectedFileCount = files.length;
      this.fileInfos = [];
  
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          const reader = new FileReader();
          
          reader.onload = () => {
            this.fileInfos.push({
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: new Date(file.lastModified).toLocaleDateString()
            });
          };
  
          reader.readAsText(file);
        }
      }
    }
  }    

  async writeFile() {
    // Check for API support
    if (!('chooseFileSystemEntries' in window)) {
      alert('Native File System API not supported');
      return;
    }

    try {
      const handle = await window.chooseFileSystemEntries({
        type: 'save-file',
      });

      const file = await handle.getFile();
      const writer = await handle.createWriter();
      await writer.write(0, 'Hello world from What Web Can Do!');
      await writer.close();

      // Update UI or handle success
    } catch (error) {
      // Handle errors
    }
  }

  checkStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        this.usage = estimate.usage ?? 'unknown';
        this.quota = estimate.quota ?? 'unknown';
        this.percent = estimate.quota && estimate.usage !== undefined 
                       ? ((estimate.usage * 100) / estimate.quota).toFixed(0) 
                       : 'unknown';
      });
    }
  }

  checkPersisted() {
    if ('storage' in navigator && 'persisted' in navigator.storage) {
      navigator.storage.persisted().then(persisted => {
        this.persisted = persisted ? 'persisted' : 'not persisted';
      });
    }
  }

  requestPersistence() {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist().then(persisted => {
        this.persisted = persisted ? 'persisted' : 'not persisted';
      });
    }
  }
}