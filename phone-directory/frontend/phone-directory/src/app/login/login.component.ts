import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/http/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';
  pwdType = "password"

  constructor(private dialogRef: MatDialogRef<LoginComponent>, private service: UserService,
    private router: Router) { }

  ngOnInit(): void {
  }

  onCancelClick(){
    this.dialogRef.close();
  }

  onLoginClick(){
    //login and store user details in session storage, then reload to go show directory
    this.service.getUser({
      username: this.username, password: this.password
    }).subscribe( res => {
      if(res.users) {
        this.service.storeUser(this.username, this.password, res.users._id);
        window.location.reload();
      }
    })
  }

  checkLogin(){
    //check user login form inputs
    if(this.username.length == 0 || this.password.length == 0) return true;
    else return false;
  }

  changeVisibility(){
    //toggle password visibility
    this.pwdType = this.pwdType == "password" ? "text" : "password";
  }

}
