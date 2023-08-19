<template>
  <img src="https://play-lh.googleusercontent.com/4RmwPGmLo8-wy7vhiI4PWupkjcZx8fW8B-GXW4uotskN5LSwuceoOJftIq1nrX2few" alt="imagenotfound" id="logo">
  <h1 id="heading">BROCHILL</h1>
  <div class="nav">
    <ul class="navbar">
      <li><a href="#" @click="openModal('uploadimage')">UploadImage</a></li>
      <li><a href="#" @click="openModal('searchimage')">SearchImage</a></li>
    </ul>
  </div>
  <!-- Upload Image Modal -->
  <div class="modal" id="uploadimage">
    <div class="modal-content">
    <span class="close" @click="closeModal('uploadimage')">&times;</span> 
    <h2>Upload Your Image Here</h2>
      <form enctype="multipart/form-data">
        <table>
          <tr>
            <td><input type="text" placeholder="Enter your tagname" v-model="uploadTag" required></td>
          </tr>
          <tr>
            <td><input type="file"  ref="fileinput"  accept="image/*" required @change="handleFileChange"></td>
          </tr>
          <tr>
            <td> <button @click.prevent="uploadImage" class="sub" :disabled="isUploading">Upload</button></td>
          </tr>
        </table>
      </form>
      <div v-if="isUploading" class="loading-spinner"></div>
      <p v-if="uploadMessage && !uploadMessageShown" class="upload-message">{{ uploadMessage }}</p>
    </div>
  </div>

  <!-- Search Modal-->
  <div class="modal" id="searchimage">
    <div class="modal-content">
      <span class="close" @click="closeModal('searchimage')" >&times;</span>
      <h2>Search Your Image Here</h2>
       <form @submit.prevent="searchImages"> 
        <input type="text" placeholder="Enter Your Tagname" required v-model="searchTag">
        <br><br>
        <button class="sub">Search</button>
        <h2 v-if="searchResults.length === 0 && searchResultsFetched && showSearchModal">No results found.</h2>
      </form>
    </div>
  </div>
     
     <!--Image Gallery-->
     <div class="imagegallery">
     <h1 id="subheading">Image Gallery</h1>
  <div v-for="(image, index) in sortedImages" :key="index">
    <img :src="getImageUrl(image.filePath)" :alt="image.tagname" :class="{ 'latest-image': index === 0 }">
    <h2>{{ image.tagname }}</h2>
  </div>
  </div>
     <!-- Search Results Modal -->
<div class="modal" id="searchResultsModal">
  <div class="modal-content">
    <span class="close" @click="closeModal('searchResultsModal')">&times;</span>
    <h2>Here Are your Results</h2>
    <div class="Resultimages">
    <div v-for="(result, index) in searchResults" :key="index" :class="{'div1': true, 'single-image': searchResults.length === 1}">
    <img :src="getImageUrl(result.filePath)" :alt="result.tagname">
    <h2>{{ result.tagname }}</h2>
  </div>
</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
export default {
  data() {
    return {
      showUploadModal: false,
      showSearchModal: false,
      uploadTag: '',
      selectedFile: null,
      uploadMessage: '',
      isUploading: false,
      searchResultsFetched: false,
      searchTag: '',
      searchResults: [],
      uploadedImages: [],
      baseUrl: 'http://localhost:3000',
      showSearchResultsModal: false, 
      uploadMessageShown:false,
      latestImage:{}
    };
  },
  computed: {
  sortedImages() {
    const allImages = [...this.uploadedImages];

    const sorted = allImages.slice().sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sorted.reverse();
  },
},

  mounted() {
    this.fetchImages(); // Fetch images when the component is mounted
  },
  setup() {
   
    const fileInput = ref(null);
    onMounted(() => {
      if (fileInput.value) {
        fileInput.value.addEventListener('change', (event) => {
          const file = event.target.files[0];
          this.selectedFile.value = file;
        });
      }
    });
  },
  
  methods: {
    openModal(modalId) {
      if (modalId === 'uploadimage') {
        this.showUploadModal = true;
        document.getElementById('uploadimage').style.display = 'block';
        if (this.uploadMessageShown) {
      this.uploadMessageShown = false; // Reset the flag
    } else {
      this.uploadMessage = ''; // Clear the upload message
    }
      } else if (modalId === 'searchimage') {
        this.showSearchModal = true;
        document.getElementById('searchimage').style.display = 'block';
        this.searchResultsFetched = false;
      }
      else if (modalId === 'searchResultsModal') {
        this.showSearchResultsModal = true;
        document.getElementById('searchResultsModal').style.display = 'block';
      }
    },
    closeModal(modalId) {
      if (modalId === 'uploadimage') {
        this.showUploadModal = false;
        document.getElementById('uploadimage').style.display = 'none';
      } else if (modalId === 'searchimage') {
        this.showSearchModal = false;
        document.getElementById('searchimage').style.display = 'none';
        this.searchTag = '';
      }
      else if (modalId === 'searchResultsModal') {
        this.showSearchResultsModal = false;
        document.getElementById('searchResultsModal').style.display = 'none';
      }
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    
    getImageUrl(filePath) {
      const filename = filePath.split('/').pop();
      return `${this.baseUrl}/Files/${filename}`;
    },
    
    async uploadImage() {
      try {
        if (!this.selectedFile) {
          console.error('No file selected');
          return;
        }
        this.isUploading = true; 
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('tagname', this.uploadTag);
        formData.append('fileName', this.selectedFile.name);
        formData.append('filePath', this.selectedFile.name);
        console.log('Sending request to', `${this.baseUrl}/upload`);
        const response = await fetch(`${this.baseUrl}/upload`, {
          method: 'POST',
          body: formData,
        });
        console.log('Response:', response);
    if (response.ok) {
      console.log('Image uploaded successfully');
      this.uploadTag = '';
      this.selectedFile = null;
      this.uploadMessage = 'Image uploaded successfully.';
      this.uploadMessageShown = true;
      this.fetchImages();
      this.closeModal('uploadimage');
      this.openModal('uploadimage');
    } else {
      console.error('Image upload failed');
      this.uploadMessage = 'Failed to upload image.';
      this.uploadMessageShown = true;
    }
  } catch (error) {
    console.error('An error occurred during image upload:', error);
    this.uploadMessage ='Failed to upload image.';
    this.uploadMessageShown = true;
  }
  finally {
    this.isUploading = false; // Clear the loading state
  }
},
async fetchImages() {
  try {
    const response = await axios.get(`${this.baseUrl}/get`);
    this.uploadedImages = response.data;

    // Set the latest image after fetching images
    if (this.uploadedImages.length > 0) {
          this.latestImage = this.sortedImages[0];
        }
  } catch (error) {
    console.error('An error occurred while fetching images:', error);
  }
},
    async searchImages() {
      try {
        const response = await axios.get(`${this.baseUrl}/search/tags`, {
          params: { tags: this.searchTag },
        });
        console.log('Response:', response); 
        if (response.status === 200) {
          this.searchResults = response.data;
          this.searchResultsFetched = true;
          this.closeModal('searchimage');
          this.openModal('searchResultsModal');
          this.showSearchResultsModal = true;
          console.log('Search Results:', this.searchResults);
        } else {
          console.error('Image search failed');
          this.searchResults = [];
          this.searchResultsFetched = true;
        }
      } catch (error) {
        console.error('An error occurred during image search:', error);
        this.searchResults = [];
        this.searchResultsFetched = true;
      }
    },
  },
};
</script>
<style>
body{
  margin:0;
  padding: 0;
}
  .nav {
    width: 100%;
    height: 50px;
    background-color: green;
    position: absolute;
    top:70px;
  }
  .nav ul{
    list-style-type: none;
    display: flex;
  }
  .nav li{
    position:relative;
    left:1000px;
    font-size: 30px;
    padding-right: 30px;
  }
  #subheading
  {
    position: absolute;
    top:100px;
  }
  #heading{
    text-align: center;
    position: absolute;
    top:0px;
    left:600px;
  }
  #logo
  {
    width:70px;
    height:30px;
    border-radius: 50%;
    position: relative;
    left:520px;
    top:23px;
  }
  h2{
    text-align: center;
  }
  .modal
  {
    display: none;
    position: fixed;
    left:500px;
    top:150px;
    width:30%;
    height:500px;
    overflow: auto;
    z-index:1;
    font-size: 20px;
  }  
.modal-content
{
  background-color: #f7f7f7;
  margin: 10% auto;
  padding:20px;
  border:1px solid #888;
  width:80%;
  border-radius: 10px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: relative;
  overflow: auto;
  max-height: 100vh;
}
input[type="text"],[type="submit"],[type="file"],button{
    width: 80%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    margin-bottom: 15px;
  }
span{
  float:right;
  font-size: 30px;
}
span:hover{
  color:red;
}
.sub:hover{
  background-color: green;
}
.upload-message {
  color: green;
  }
  .upload-error {
  color: red;
}
  #searchResultsModal {
  display: none;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height:auto;
  /*max-height: 80vh; */
  overflow:hidden;
  z-index: 1;
}

#searchResultsModal .modal-content {
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

#searchResultsModal .close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

#searchResultsModal .close:hover,
#searchResultsModal .close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

#searchResultsModal h2 {
  margin-top: 0;
}

#searchResultsModal .modal-content .modal-body {
  padding: 20px; 
}

#searchResultsModal .Resultimages {
  display: flex;
  flex-wrap: wrap;
  justify-content:flex-start;
  align-items: flex-start;
  margin-top: 20px;
}

#searchResultsModal .div1 {
  box-sizing: border-box;
  margin: 10px;
  text-align: center;
  flex: 1 1 calc(33.33% - 20px);
}

#searchResultsModal .div1.single-image {
  box-sizing: border-box;
  margin: 10px auto;
  text-align: center;
  width: auto;
}

#searchResultsModal .div1.single-image img {
  height:300px;
  max-width: 50%;
  border-radius: 8%;
}

#searchResultsModal img {
  height: 250px;
  width: 100%;
  border-radius: 8%;
}

#searchResultsModal h2 {
  margin: 5px 0;
}
.loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 10px auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  /* Styles for the image gallery */
.imagegallery {
  text-align: center;
  margin-top: 40px;
  position:absolute;
  top:100px;
}


#subheading {
  font-size: 24px;
  margin-bottom: 20px;
  position:relative;
  top:0px;
}

.imagegallery div {
  display: inline-block;
  margin: 10px;
  text-align: center;
  vertical-align: top;
  width: calc(33.33% - 20px);
  box-sizing: border-box;
}


.imagegallery img {
  width: 100%;
  height:60vh;
  border-radius: 8%;
  border: 2px solid #ccc;
}

.latest-image {
  border: 2px solid #3498db;
}


</style>
