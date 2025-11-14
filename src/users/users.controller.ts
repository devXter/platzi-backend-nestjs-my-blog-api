import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './user.dto';

interface User {
  id: string;
  name: string;
  email: string;
}

@Controller('users')
export class UsersController {
  private readonly users: User[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
    { id: '2', name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: '3', name: 'John Smith', email: 'john.smith@example.com' },
    { id: '4', name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: '5', name: 'Robert Johnson', email: 'robert.johnson@example.com' },
    { id: '6', name: 'Emily Williams', email: 'emily.williams@example.com' },
    { id: '7', name: 'Michael Brown', email: 'michael.brown@example.com' },
    { id: '8', name: 'Sarah Davis', email: 'sarah.davis@example.com' },
  ];

  private validateEmail(email: string): void | UnprocessableEntityException {
    if (!email.includes('@')) {
      throw new UnprocessableEntityException('Email must contain @');
    }

    if (email.includes(' ')) {
      throw new UnprocessableEntityException('Email must not contain spaces');
    }

    if (email.indexOf('@') !== email.lastIndexOf('@')) {
      throw new UnprocessableEntityException('Email must contain only one @');
    }

    // Verificar que haya un punto DESPUÉS del @
    const atIndex: number = email.indexOf('@');
    const domain: string = email.substring(atIndex + 1);

    if (!domain.includes('.')) {
      throw new UnprocessableEntityException('Email domain must contain a dot');
    }

    if (domain.endsWith('.')) {
      throw new UnprocessableEntityException('Email domain cannot end with a dot');
    }

    // Validar que el dominio no empiece con punto
    if (domain.startsWith('.')) {
      throw new UnprocessableEntityException('Email domain cannot start with a dot');
    }
  }

  @Get()
  getUsers(): User[] {
    return this.users;
  }

  @Get(':id')
  getUser(@Param('id') id: string): User | NotFoundException {
    const user: User | undefined = this.users.find((user: User) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  createUser(@Body() body: CreateUserDto): User | BadRequestException {
    if (!body.name || !body.email) {
      throw new BadRequestException('Name and email are required');
    }

    this.validateEmail(body.email);

    if (this.users.find((user: User) => user.email === body.email)) {
      throw new BadRequestException('Email already exists');
    }

    const maxId: number = this.users.reduce((max: number, user: User) => Math.max(max, parseInt(user.id)), 0);

    const user: User = {
      id: (maxId + 1).toString(),
      name: body.name,
      email: body.email,
    };
    this.users.push(user);
    return user;
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): { message: string } | NotFoundException {
    const userIndex: number = this.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    this.users.splice(userIndex, 1);
    return { message: 'User deleted successfully' } as const;
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: User): User | NotFoundException | BadRequestException {
    const userIndex: number = this.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    if (body.email) {
      this.validateEmail(body.email);

      if (this.users.find((user: User) => user.email === body.email)) {
        throw new BadRequestException('Email already exists');
      }
    }

    this.users[userIndex] = { ...this.users[userIndex], ...body };
    return this.users[userIndex];
  }
}
