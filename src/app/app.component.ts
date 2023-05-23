import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthenticatorComponent } from './tools/authenticator/authenticator.component';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'JosephSocialMedia';
  auth = new FirebaseTSAuth();
  firestore = new FirebaseTSFirestore();
  userHasProfile = true;
  private static userDocument: userDocument | null;

  constructor(private loginSheet: MatBottomSheet, private router: Router) {
    this.auth.listenToSignInStateChanges(user => {
      this.auth.checkSignInState({
        whenSignedIn: user => {
          // alert("Logged In");
        },
        whenSignedOut: user => {
          // alert("Logged Out");
          AppComponent.userDocument = null;
        },
        whenSignedInAndEmailNotVerified: user => {
          this.router.navigate(["emailVerification"]);
        },
        whenSignedInAndEmailVerified: user => {
          this.getUserProfile();
        },
        whenChanged: user => {

        }
      });
    });
  }

  public static getUserDocument() {
    try {
      return AppComponent.userDocument;
    } catch (err) {
      return null;
    }
  }

  getUsername() {
    return AppComponent.userDocument?.publicName;
  }

  getUserProfile() {
    this.firestore.listenToDocument({
      name: "Getting Document",
      path: ["Users", this.auth.getAuth().currentUser!.uid],
      onUpdate: (result) => {
        AppComponent.userDocument = <userDocument>result.data();
        this.userHasProfile = result.exists;
        AppComponent.userDocument.userId = this.auth.getAuth().currentUser!.uid;
        if (this.userHasProfile) {
          this.router.navigate(["postfeed"])
        }
      }
    });
  }

  onLogoutClick() {
    this.auth.signOut();
  }

  loggedIn() {
    return this.auth.isSignedIn();
  }

  onLoginClick() {
    this.loginSheet.open(AuthenticatorComponent)
  }
}

export interface userDocument {
  publicName: string;
  description: string;
  userId: string;
}