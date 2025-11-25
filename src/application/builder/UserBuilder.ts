import {User} from '../../domain/entities/User';

export class UserBuilder {
    private id: string = '';
    private firstname: string = '';
    private lastname: string = '';
    private email: string = '';
    private phoneNumber: string = '';
    private emailVerified: boolean = false;
    private phoneVerified: boolean = false;
    private refreshToken: string = '';
    private TOSAccepted: boolean = false;
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setId(id: string): this {
        this.id = id;
        return this;
    }

    public setFirstname(firstname: string): this {
        this.firstname = firstname;
        return this;
    }

    public setLastname(lastname: string): this {
        this.lastname = lastname;
        return this;
    }

    public setEmail(email: string): this {
        this.email = email;
        return this;
    }

    public setPhoneNumber(phoneNumber: string): this {
        this.phoneNumber = phoneNumber;
        return this;
    }

    public setEmailVerified(emailVerified: boolean): this {
        this.emailVerified = emailVerified;
        return this;
    }

    public setPhoneVerified(phoneVerified: boolean): this {
        this.phoneVerified = phoneVerified;
        return this;
    }

    public setRefreshToken(refreshToken: string): this {
        this.refreshToken = refreshToken;
        return this;
    }

    public setTOSAccepted(TOSAccepted: boolean): this {
        this.TOSAccepted = TOSAccepted;
        return this;
    }

    public setCreatedAt(createdAt: Date): this {
        this.createdAt = createdAt;
        return this;
    }

    public setUpdatedAt(updatedAt: Date| null): this {
        this.updatedAt = updatedAt;
        return this;
    }

    public build(): User {
        return new User(
            this.id,
            this.firstname,
            this.lastname,
            this.email,
            this.phoneNumber,
            this.emailVerified,
            this.phoneVerified,
            this.refreshToken,
            this.TOSAccepted,
            this.createdAt,
            this.updatedAt
        );
    }
}