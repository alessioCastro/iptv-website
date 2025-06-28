export class PantryClient {
  constructor(pantryId, basketName) {
    this.pantryId = pantryId;
    this.basketName = basketName;
    this.baseUrl = `https://getpantry.cloud/apiv1/pantry/${this.pantryId}/basket/${this.basketName}`;
  }
  
  async createBasket(initialData = {}) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialData)
    });
    if (!res.ok) throw new Error('Erro ao criar basket');
    return await res.json();
  }
  
  async getAllUsers() {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error('Erro ao buscar usuários');
    return await res.json();
  }
  
  async getUser(email) {
    const users = await this.getAllUsers();
    return users[email] || null;
  }
  
  async addUser(email, data) {
    const users = await this.getAllUsers();
    if (users[email]) throw new Error('Usuário já existe');
    users[email] = this._sanitizeUser(data);
    await this._save(users);
  }
  
  async updateUser(email, newFields) {
    const users = await this.getAllUsers();
    if (!users[email]) throw new Error('Usuário não encontrado');
    
    const merged = { ...users[email], ...newFields };
    users[email] = this._sanitizeUser(merged);
    
    await this._save(users);
  }
  
  async removeUser(email) {
    const users = await this.getAllUsers();
    if (!users[email]) throw new Error('Usuário não encontrado');
    
    delete users[email];
    await this._save(users);
  }
  
  async addProfile(email, newProfile) {
    const users = await this.getAllUsers();
    const user = users[email];
    if (!user) throw new Error('Usuário não encontrado');
    
    user.profiles = user.profiles || [];
    
    const exists = user.profiles.some(p =>
      p.name.toLowerCase() === newProfile.name.toLowerCase()
    );
    if (exists) throw new Error('Já existe um perfil com esse nome');
    
    user.profiles.push(newProfile);
    user.profiles = this._deduplicateProfiles(user.profiles);
    
    users[email] = this._sanitizeUser(user);
    await this._save(users);
    
    return user;
  }
  
  async removeProfile(email, profileName) {
    console.log(email)
    console.log(profileName);
    const users = await this.getAllUsers();
    const user = users[email];
    if (!user) throw new Error('Usuário não encontrado');
    
    const originalLength = user.profiles?.length || 0;
    user.profiles = (user.profiles || []).filter(
      p => p.name.toLowerCase() !== profileName.toLowerCase()
    );
    
    if (user.profiles.length === originalLength) {
      throw new Error('Perfil não encontrado');
    }
    
    users[email] = this._sanitizeUser(user);
    await this._save(users);

    return user;
  }
  
  async _save(data) {
    const res = await fetch(this.baseUrl, {
      method: 'POST', // ✅ POST sempre, para evitar comportamento maluco do Pantry
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    console.log('Salvando no Pantry:', data);
    
    if (!res.ok) throw new Error('Erro ao salvar dados');
  }
  
  _deduplicateProfiles(profiles) {
    const seen = new Set();
    return profiles.filter(p => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  _sanitizeUser(user) {
    if (Array.isArray(user.profiles)) {
      user.profiles = this._deduplicateProfiles(user.profiles);
    }
    return user;
  }
}