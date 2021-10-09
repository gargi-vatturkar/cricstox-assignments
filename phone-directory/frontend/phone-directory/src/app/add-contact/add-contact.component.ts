import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../http/user.service';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactComponent implements OnInit {

  //create reactive form for contact adding/editinng
  //notes have maximum limit of 100 character
  //mobile should be all digits (10 digits) - with first not being 0
  //landline should be all digits (8 digits) - with first not being 0
  contactForm = this.fb.group({
    fName: ['', Validators.required],     //first annd last name are mandatory
    mName: [''],
    lName: ['', Validators.required],
    photo: [null],
    email: ['', Validators.email],
    mobile: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[1-9]{1}[0-9]{9}$')]],
    landline: ['', [Validators.minLength(8), Validators.maxLength(8), Validators.pattern('^[1-9]{1}[0-9]{7}$')]],
    notes: ['', Validators.maxLength(100)]
  });

  //default image url
  photoPreview: any = "assets/user.png";
  error = { show: false, message: "" };
  user;
  showLoader = false;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AddContactComponent>,
    private service: UserService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    //get user from session storage
    this.user = JSON.parse(sessionStorage.getItem("directoryUser"));

    //if screen is for editing, fill in available values in form
    if (this.data.screen == "edit") {
      this.photoPreview = this.data.contact.photoUrl ? this.data.contact.photoUrl : "assets/user.png";

      this.contactForm.get("fName").setValue(this.data.contact.first_name);
      this.contactForm.get("mName").setValue(this.data.contact.middle_name);
      this.contactForm.get("lName").setValue(this.data.contact.last_name);

      this.contactForm.get("email").setValue(this.data.contact.email);
      this.contactForm.get("mobile").setValue(this.data.contact.mobile);
      this.contactForm.get("landline").setValue(this.data.contact.landline);
      this.contactForm.get("notes").setValue(this.data.contact.notes);
    }
  }

  onClickAdd() {
    if (this.data.screen == "add") {
      //create object and call backend to add contact

      this.showLoader = true;
      let contact = {
        first_name: this.contactForm.get("fName").value,
        middle_name: this.contactForm.get("mName").value,
        last_name: this.contactForm.get("lName").value,
        email: this.contactForm.get("email").value,
        mobile: this.contactForm.get("mobile").value,
        landline: this.contactForm.get("landline").value,
        notes: this.contactForm.get("notes").value,
        date_added: Date.now()
      }

      this.service.addContact(this.user["id"], contact, this.contactForm.get("photo").value).
        subscribe(res => {
          this.showLoader = false;
          if (res['message'] && res['message'].indexOf("succes") > -1){
            this.dialogRef.close();
          }
          else{
            this.error = {show: true, message: "Problem saving Contact!" }
          }
        });
    }
    else if (this.data.screen == "edit") {
      //create object annd call backend to edit contact

      this.showLoader = true;
      let contact = {
        first_name: this.contactForm.get("fName").value,
        middle_name: this.contactForm.get("mName").value,
        last_name: this.contactForm.get("lName").value,
        email: this.contactForm.get("email").value,
        mobile: this.contactForm.get("mobile").value,
        landline: this.contactForm.get("landline").value,
        notes: this.contactForm.get("notes").value,
        date_edited: Date.now(),
        photoUrl: this.data.contact.photoUrl
      }

      this.service.updateContact(this.user["id"], this.data.contact["_id"], contact, this.contactForm.get("photo").value).
        subscribe(res => {
          this.showLoader = false;
          //send data to contact details page and update immediately
          if (res['message'] && res['message'].indexOf("succes") > -1){
            this.dialogRef.close({ contact: contact, url: res["updatedPhotUrl"] });
          }
          else{
            this.error = {show: true, message: "Problem saving Contact!" }
          }
        });
    }
  }

  onImgSelected(event) {
    let type = event.target.files[0].type.split("/");
    let size = (event.target.files[0].size) / 1024;

    //validate maximum image size allowed to 500kb
    if (size >= 500) {
      this.error.show = true;
      this.error.message = "Supported file sizes below 500Kb";
    }
    else {
      //validate image formats to jpg, jpeg and png only
      if (["jpg", "jpeg", "png"].indexOf(type[type.length - 1]) > -1) {

        this.error.show = false;
        this.contactForm.patchValue({ photo: event.target.files[0] });
        this.contactForm.get("photo").updateValueAndValidity();

        let reader = new FileReader();
        reader.onload = () => {
          this.photoPreview = reader.result;
        }
        reader.readAsDataURL(event.target.files[0]);
        //read file as url to show thumbnail as soon as uploaded
      }
      else {
        this.error.show = true;
        this.error.message = "Unsupported file type"
      }
    }
  }

  onCancelClick() {
    this.dialogRef.close();
  }

}
